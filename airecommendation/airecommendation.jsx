import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  HelpCircle, 
  Check, 
  TrendingUp, 
  Plus, 
  Trash2, 
  RotateCcw,
  Award,
  AlertCircle
} from 'lucide-react';

export default function AiRecommendationPage() {
  // --- Decision Weight Configurations (fractions summing to 1.0) ---
  const [weights, setWeights] = useState({
    price: 0.30,
    delivery: 0.20,
    rating: 0.20,
    quality: 0.15,
    onTime: 0.10,
    response: 0.05
  });

  // --- Stateful Database (from your Python script values) ---
  const [vendors, setVendors] = useState([
    { name: "ABC Pvt Ltd", Price: 92000, Delivery_Days: 5, Rating: 4.8, Quality: 92, OnTimeDelivery: 96, ResponseTime: 2 },
    { name: "XYZ Industries", Price: 88000, Delivery_Days: 8, Rating: 4.5, Quality: 88, OnTimeDelivery: 90, ResponseTime: 5 },
    { name: "Tech Supplies", Price: 90000, Delivery_Days: 6, Rating: 4.9, Quality: 95, OnTimeDelivery: 94, ResponseTime: 3 },
    { name: "Global Traders", Price: 91000, Delivery_Days: 4, Rating: 4.6, Quality: 91, OnTimeDelivery: 98, ResponseTime: 1 },
    { name: "Prime Electronics", Price: 87000, Delivery_Days: 7, Rating: 4.4, Quality: 87, OnTimeDelivery: 89, ResponseTime: 6 }
  ]);

  // For adding custom vendors in the UI
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorPrice, setNewVendorPrice] = useState(90000);
  const [newVendorDelivery, setNewVendorDelivery] = useState(5);
  const [newVendorRating, setNewVendorRating] = useState(4.5);
  const [newVendorQuality, setNewVendorQuality] = useState(90);
  const [newVendorOnTime, setNewVendorOnTime] = useState(95);
  const [newVendorResponse, setNewVendorResponse] = useState(3);
  const [showAddForm, setShowAddForm] = useState(false);

  // Current selected vendor to display on the Radar chart (defaults to best vendor)
  const [selectedVendorName, setSelectedVendorName] = useState(null);

  // Reset Weights helper
  const resetWeights = () => {
    setWeights({
      price: 0.30,
      delivery: 0.20,
      rating: 0.20,
      quality: 0.15,
      onTime: 0.10,
      response: 0.05
    });
  };

  // Weight Change Handler with Auto-Balancing logic
  const handleWeightChange = (key, rawValue) => {
    const val = rawValue / 100;
    const oldVal = weights[key];
    const diff = val - oldVal;
    
    if (diff === 0) return;
    
    const keys = Object.keys(weights);
    const otherKeys = keys.filter(k => k !== key);
    const sumOthers = otherKeys.reduce((acc, k) => acc + weights[k], 0);
    
    let newWeights = { ...weights };
    newWeights[key] = val;
    
    if (sumOthers > 0) {
      otherKeys.forEach(k => {
        // distribute the diff proportionally
        newWeights[k] = Math.max(0, weights[k] - diff * (weights[k] / sumOthers));
      });
    } else {
      otherKeys.forEach(k => {
        newWeights[k] = Math.max(0, (1 - val) / otherKeys.length);
      });
    }
    
    // Normalize weights to sum exactly to 1.0 to handle float rounding anomalies
    const newSum = Object.values(newWeights).reduce((acc, w) => acc + w, 0);
    if (newSum > 0) {
      Object.keys(newWeights).forEach(k => {
        newWeights[k] = newWeights[k] / newSum;
      });
    }
    
    setWeights(newWeights);
  };

  // --- MCDA Calculations ---
  const minPrice = Math.min(...vendors.map(v => v.Price));
  const minDelivery = Math.min(...vendors.map(v => v.Delivery_Days));
  const maxRating = Math.max(...vendors.map(v => v.Rating));
  const maxQuality = Math.max(...vendors.map(v => v.Quality));
  const maxOnTime = Math.max(...vendors.map(v => v.OnTimeDelivery));
  const minResponse = Math.min(...vendors.map(v => v.ResponseTime));

  const rankedVendors = vendors.map(v => {
    const priceScore = minPrice / v.Price;
    const deliveryScore = minDelivery / v.Delivery_Days;
    const ratingScore = v.Rating / maxRating;
    const qualityScore = v.Quality / maxQuality;
    const onTimeScore = v.OnTimeDelivery / maxOnTime;
    const responseScore = minResponse / v.ResponseTime;

    const aiScore = (
      priceScore * weights.price +
      deliveryScore * weights.delivery +
      ratingScore * weights.rating +
      qualityScore * weights.quality +
      onTimeScore * weights.onTime +
      responseScore * weights.response
    );

    return {
      ...v,
      priceScore,
      deliveryScore,
      ratingScore,
      qualityScore,
      onTimeScore,
      responseScore,
      aiScore
    };
  }).sort((a, b) => b.aiScore - a.aiScore);

  const bestVendor = rankedVendors[0];

  // Set the selected vendor to the best one on mount or when best vendor changes
  useEffect(() => {
    if (bestVendor && !selectedVendorName) {
      setSelectedVendorName(bestVendor.name);
    }
  }, [bestVendor, selectedVendorName]);

  const selectedVendorObj = rankedVendors.find(v => v.name === selectedVendorName) || bestVendor;

  // Add Vendor Handler
  const handleAddVendor = (e) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const newVendor = {
      name: newVendorName,
      Price: Number(newVendorPrice),
      Delivery_Days: Number(newVendorDelivery),
      Rating: Number(newVendorRating),
      Quality: Number(newVendorQuality),
      OnTimeDelivery: Number(newVendorOnTime),
      ResponseTime: Number(newVendorResponse)
    };

    setVendors(prev => [...prev, newVendor]);
    setNewVendorName('');
    setShowAddForm(false);
  };

  // Delete Vendor Handler
  const handleDeleteVendor = (name) => {
    if (vendors.length <= 2) {
      alert("At least 2 vendors are required for the ranking process.");
      return;
    }
    setVendors(prev => prev.filter(v => v.name !== name));
    if (selectedVendorName === name) {
      setSelectedVendorName(null);
    }
  };

  // --- SVG Radar Chart Points Generator (6 Axes) ---
  const center = 150;
  const radius = 90;
  const numAxes = 6;
  const labels = ["Price", "Delivery", "Rating", "Quality", "OnTime", "Response"];

  const getRadarPoints = (v) => {
    if (!v) return '';
    const scores = [
      v.priceScore,
      v.deliveryScore,
      v.ratingScore,
      v.qualityScore,
      v.onTimeScore,
      v.responseScore
    ];
    return scores.map((score, i) => {
      const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
      const x = center + radius * score * Math.cos(angle);
      const y = center + radius * score * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Color heat map calculator for table
  const maxScore = Math.max(...rankedVendors.map(v => v.aiScore));
  const minScore = Math.min(...rankedVendors.map(v => v.aiScore));
  const scoreRange = maxScore - minScore;

  const getScoreBgColor = (score) => {
    const ratio = scoreRange > 0 ? (score - minScore) / scoreRange : 1;
    // Maps to Greens colormap transparency
    return `rgba(16, 185, 129, ${0.1 + ratio * 0.4})`;
  };

  // Evaluate dynamic reasons for recommendations based on actual normalized score performance
  const getDynamicReasons = (v) => {
    if (!v) return [];
    const reasons = [];
    if (v.priceScore >= 0.95) reasons.push("Competitive Pricing (Lowest Cost)");
    if (v.deliveryScore >= 0.9) reasons.push("Fast Delivery turnaround");
    if (v.ratingScore >= 0.9) reasons.push("Excellent Supplier Rating");
    if (v.qualityScore >= 0.9) reasons.push("Premium Manufacturing Quality");
    if (v.onTimeScore >= 0.95) reasons.push("Consistent On-Time Fulfillment");
    if (v.responseScore >= 0.9) reasons.push("Rapid Communication Response");

    // Fallbacks if threshold is too high
    if (reasons.length === 0) {
      reasons.push("Optimal Cost-Quality Balance");
      reasons.push("Reliable General Performance");
    }
    return reasons.slice(0, 4); // return max 4 top key reasons
  };

  return (
    <div className="ai-recommender-wrapper animate-fade-in" style={styles.container}>
      <style>{customCSS}</style>

      {/* Header Title section */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>AI Procurement Recommender</h2>
          <p style={styles.subtitle}>Multi-Criteria Decision Analysis (MCDA) for Supplier Selection</p>
        </div>
        <button onClick={resetWeights} style={styles.resetBtn}>
          <RotateCcw size={15} />
          <span>Reset Weights</span>
        </button>
      </header>

      {/* 2-Column Main Layout */}
      <div style={styles.mainGrid}>
        
        {/* Left Side: Parameters sliders & Vendor Input database */}
        <div style={styles.leftCol}>
          
          {/* Sliders Container Card */}
          <div className="glass-panel" style={styles.configCard}>
            <div style={styles.cardHeader}>
              <Settings size={18} color="var(--primary)" />
              <h3 style={styles.cardHeaderTitle}>Adjust Decision Criteria Weights</h3>
              <span style={styles.weightBadge}>Total: 100%</span>
            </div>

            <div style={styles.slidersList}>
              {[
                { key: 'price', label: 'Price (Low Cost)', desc: 'Higher weight prioritizes lowest bids' },
                { key: 'delivery', label: 'Delivery Speed', desc: 'Prioritizes shortest delivery lead-times' },
                { key: 'rating', label: 'Rating Score', desc: 'Prioritizes historical supplier scorecards' },
                { key: 'quality', label: 'Product Quality', desc: 'Prioritizes batch quality rates' },
                { key: 'onTime', label: 'On-Time Fulfillment', desc: 'Prioritizes on-time shipment reliability' },
                { key: 'response', label: 'Response Lead-Time', desc: 'Prioritizes customer service responsiveness' }
              ].map(item => (
                <div key={item.key} style={styles.sliderItem}>
                  <div style={styles.sliderLabelRow}>
                    <div>
                      <span style={styles.sliderLabel}>{item.label}</span>
                      <span style={styles.sliderDesc}>{item.desc}</span>
                    </div>
                    <span style={styles.sliderPercent}>{Math.round(weights[item.key] * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(weights[item.key] * 100)}
                    onChange={(e) => handleWeightChange(item.key, Number(e.target.value))}
                    style={styles.sliderInput}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Vendors Input Database grid */}
          <div className="glass-panel" style={styles.configCard}>
            <div style={{ ...styles.cardHeader, marginBottom: '1rem' }}>
              <h3 style={styles.cardHeaderTitle}>Supplier Inputs Dataset</h3>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                style={styles.addBtn}
              >
                <Plus size={14} />
                <span>Add Supplier</span>
              </button>
            </div>

            {/* Inline Add Vendor Form */}
            {showAddForm && (
              <form onSubmit={handleAddVendor} className="add-supplier-form animate-fade-in">
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Supplier Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Acme corp" 
                      required
                      value={newVendorName} 
                      onChange={e => setNewVendorName(e.target.value)} 
                      style={styles.formInput} 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Price (₹)</label>
                    <input 
                      type="number" 
                      min="1000"
                      value={newVendorPrice} 
                      onChange={e => setNewVendorPrice(e.target.value)} 
                      style={styles.formInput} 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Delivery (Days)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={newVendorDelivery} 
                      onChange={e => setNewVendorDelivery(e.target.value)} 
                      style={styles.formInput} 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Rating (1-5)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="1" 
                      max="5"
                      value={newVendorRating} 
                      onChange={e => setNewVendorRating(e.target.value)} 
                      style={styles.formInput} 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Quality (0-100)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={newVendorQuality} 
                      onChange={e => setNewVendorQuality(e.target.value)} 
                      style={styles.formInput} 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>On-Time (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={newVendorOnTime} 
                      onChange={e => setNewVendorOnTime(e.target.value)} 
                      style={styles.formInput} 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Response (Hrs)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={newVendorResponse} 
                      onChange={e => setNewVendorResponse(e.target.value)} 
                      style={styles.formInput} 
                    />
                  </div>
                </div>
                <div style={styles.formActions}>
                  <button type="button" onClick={() => setShowAddForm(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" style={styles.submitBtn}>Add Supplier</button>
                </div>
              </form>
            )}

            {/* List of Vendors for adjustment */}
            <div style={styles.vendorInputsList}>
              {vendors.map((v) => (
                <div key={v.name} style={styles.vendorInputItem}>
                  <div>
                    <div style={styles.vendorInputName}>{v.name}</div>
                    <div style={styles.vendorInputMetrics}>
                      Price: ₹{v.Price.toLocaleString()} | Delivery: {v.Delivery_Days}d | Rating: {v.Rating} ⭐
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteVendor(v.name)}
                    style={styles.deleteBtn}
                    title="Delete Supplier Record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Recommendation insights, Radar chart, and Rankings Table */}
        <div style={styles.rightCol}>
          
          {/* Spotlight Recommender Card */}
          {bestVendor && (
            <div className="glass-panel recommend-spotlight" style={styles.spotlightCard}>
              
              {/* Card top banner */}
              <div style={styles.spotlightBanner}>
                <div style={styles.spotlightHeaderLeft}>
                  <Award size={24} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.3))' }} />
                  <div>
                    <span style={styles.spotlightPreTitle}>🏆 AI RECOMMENDED SUPPLIER</span>
                    <h3 style={styles.spotlightTitle}>{bestVendor.name}</h3>
                  </div>
                </div>
                <div style={styles.scoreCircle}>
                  <span style={styles.scoreVal}>{bestVendor.aiScore.toFixed(3)}</span>
                  <span style={styles.scoreLabel}>AI Score</span>
                </div>
              </div>

              {/* Spotlight split details & Radar Chart */}
              <div style={styles.spotlightSplit}>
                
                {/* Details list */}
                <div style={styles.spotlightLeftCol}>
                  <div style={styles.metricsLabelGroup}>
                    <div style={styles.metricSubItem}>
                      <span style={styles.metricSubLabel}>Bid Price</span>
                      <span style={styles.metricSubVal}>₹{bestVendor.Price.toLocaleString()}</span>
                    </div>
                    <div style={styles.metricSubItem}>
                      <span style={styles.metricSubLabel}>Delivery</span>
                      <span style={styles.metricSubVal}>{bestVendor.Delivery_Days} Days</span>
                    </div>
                    <div style={styles.metricSubItem}>
                      <span style={styles.metricSubLabel}>Rating</span>
                      <span style={styles.metricSubVal}>{bestVendor.Rating} / 5.0</span>
                    </div>
                    <div style={styles.metricSubItem}>
                      <span style={styles.metricSubLabel}>Quality Score</span>
                      <span style={styles.metricSubVal}>{bestVendor.Quality}%</span>
                    </div>
                    <div style={styles.metricSubItem}>
                      <span style={styles.metricSubLabel}>On-Time Ship</span>
                      <span style={styles.metricSubVal}>{bestVendor.OnTimeDelivery}%</span>
                    </div>
                    <div style={styles.metricSubItem}>
                      <span style={styles.metricSubLabel}>Response</span>
                      <span style={styles.metricSubVal}>{bestVendor.ResponseTime} Hours</span>
                    </div>
                  </div>

                  <div style={styles.reasonsBox}>
                    <div style={styles.reasonsHeader}>🤖 Recommendation Drivers:</div>
                    <div style={styles.reasonsList}>
                      {getDynamicReasons(bestVendor).map((reason, idx) => (
                        <div key={idx} style={styles.reasonItem}>
                          <Check size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Radar Spider chart representation */}
                <div style={styles.radarChartCol}>
                  <div style={styles.radarHeader}>
                    <span style={styles.radarHeaderTitle}>Performance Footprint</span>
                    
                    {/* Switcher selector between rank suppliers */}
                    <select 
                      value={selectedVendorName || ''} 
                      onChange={(e) => setSelectedVendorName(e.target.value)}
                      style={styles.radarSelect}
                    >
                      {rankedVendors.map(rv => (
                        <option key={rv.name} value={rv.name}>{rv.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* SVG radar */}
                  <div style={styles.svgWrapper}>
                    <svg width="300" height="300" viewBox="0 0 300 300">
                      {/* Grid pentagon levels */}
                      {renderGridLines()}
                      
                      {/* Level numeric labels */}
                      <text x="150" y="130" fill="#94a3b8" style={{ fontSize: '8px' }} textAnchor="middle">25%</text>
                      <text x="150" y="105" fill="#94a3b8" style={{ fontSize: '8px' }} textAnchor="middle">50%</text>
                      <text x="150" y="85" fill="#94a3b8" style={{ fontSize: '8px' }} textAnchor="middle">75%</text>
                      <text x="150" y="62" fill="#94a3b8" style={{ fontSize: '8px' }} textAnchor="middle">100%</text>

                      {/* Axes lines & labels */}
                      {renderAxes()}

                      {/* Data polygon */}
                      {selectedVendorObj && (
                        <polygon
                          points={getRadarPoints(selectedVendorObj)}
                          fill="rgba(99, 102, 241, 0.22)"
                          stroke="var(--primary)"
                          strokeWidth="2.5"
                        />
                      )}

                      {/* Data corner dots */}
                      {selectedVendorObj && [
                        selectedVendorObj.priceScore,
                        selectedVendorObj.deliveryScore,
                        selectedVendorObj.ratingScore,
                        selectedVendorObj.qualityScore,
                        selectedVendorObj.onTimeScore,
                        selectedVendorObj.responseScore
                      ].map((val, i) => {
                        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
                        const x = center + radius * val * Math.cos(angle);
                        const y = center + radius * val * Math.sin(angle);
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4.5"
                            fill="var(--primary)"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* White Panel container showing decision matrix ranking list */}
          <div style={styles.whitePanel}>
            <h3 style={styles.sectionHeading}>DECISION MATRIX HEATMAP RANKINGS</h3>

            <table style={styles.rankingsTable}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeaderCell}>Rank</th>
                  <th style={styles.tableHeaderCell}>Supplier</th>
                  <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>Price</th>
                  <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>Delivery</th>
                  <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>Rating</th>
                  <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>Quality</th>
                  <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>On-Time</th>
                  <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>Response</th>
                  <th style={{ ...styles.tableHeaderCell, textAlign: 'right', paddingRight: '16px' }}>AI Score</th>
                </tr>
              </thead>
              <tbody>
                {rankedVendors.map((vendor, idx) => {
                  const isTop = idx === 0;
                  return (
                    <tr 
                      key={vendor.name} 
                      onClick={() => setSelectedVendorName(vendor.name)}
                      className={`rank-row-item ${selectedVendorName === vendor.name ? 'row-selected' : ''}`}
                      style={{
                        ...styles.tableBodyRow,
                        borderLeft: selectedVendorName === vendor.name ? '3px solid var(--primary)' : '3px solid transparent',
                        backgroundColor: selectedVendorName === vendor.name ? 'rgba(99,102,241,0.04)' : 'transparent'
                      }}
                    >
                      <td style={{ ...styles.tableCell, fontWeight: '700', color: isTop ? '#fbbf24' : '#64748b' }}>
                        {isTop ? '🏆 1' : idx + 1}
                      </td>
                      <td style={{ ...styles.tableCell, fontWeight: '600', color: '#1e293b' }}>
                        {vendor.name}
                      </td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>₹{vendor.Price.toLocaleString()}</td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>{vendor.Delivery_Days}d</td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>{vendor.Rating}⭐</td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>{vendor.Quality}%</td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>{vendor.OnTimeDelivery}%</td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>{vendor.ResponseTime}h</td>
                      
                      {/* Weighted Heatmap Gradient Column */}
                      <td 
                        style={{ 
                          ...styles.tableCell, 
                          textAlign: 'right', 
                          fontWeight: '700',
                          paddingRight: '16px',
                          backgroundColor: getScoreBgColor(vendor.aiScore),
                          color: '#047857'
                        }}
                      >
                        {vendor.aiScore.toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={styles.infoFooter}>
              <AlertCircle size={14} color="#64748b" style={{ flexShrink: 0 }} />
              <span>
                Scores are dynamically calculated using mathematical normalization. Lower Price/Delivery/Response and higher Rating/Quality/On-Time produce higher performance indices.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );

  // Helper function for rendering circular grid lines
  function renderGridLines() {
    const levels = [0.25, 0.5, 0.75, 1.0];
    return levels.map((lvl, idx) => {
      const points = Array.from({ length: numAxes }).map((_, i) => {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const x = center + radius * lvl * Math.cos(angle);
        const y = center + radius * lvl * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');

      return (
        <polygon
          key={idx}
          points={points}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray={lvl < 1 ? "4,4" : "none"}
        />
      );
    });
  }

  // Helper function for drawing axis lines and text labels
  function renderAxes() {
    return labels.map((lbl, i) => {
      const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      // Slightly shift text outward for clean alignment
      const textDist = radius + 22;
      const tx = center + textDist * Math.cos(angle);
      const ty = center + textDist * Math.sin(angle);

      return (
        <g key={i}>
          <line
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          <text
            x={tx}
            y={ty}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#475569"
            style={{ fontSize: '10px', fontWeight: '600' }}
          >
            {lbl}
          </text>
        </g>
      );
    });
  }
}

// Scoped custom CSS transitions
const customCSS = `
  .recommend-spotlight {
    position: relative;
    overflow: hidden;
  }
  .recommend-spotlight::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #fbbf24, #f59e0b);
  }

  .rank-row-item {
    cursor: pointer;
    transition: all 0.2s;
  }
  .rank-row-item:hover {
    background-color: rgba(0, 0, 0, 0.015) !important;
  }
  .row-selected {
    background-color: rgba(99, 102, 241, 0.04) !important;
  }

  /* Form sliders styling */
  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    background: transparent;
  }
  input[type=range]:focus {
    outline: none;
  }
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 6px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    border: none;
  }
  input[type=range]::-webkit-slider-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -5px;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
    transition: transform 0.1s;
  }
  input[type=range]::-webkit-slider-thumb:hover {
    transform: scale(1.25);
  }
`;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontFamily: 'var(--font-sans)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    margin: 0,
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
    marginTop: '0.2rem',
  },
  resetBtn: {
    background: 'none',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '24px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'var(--transition-smooth)',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '0.95fr 1.05fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  configCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardHeaderTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
    flex: 1,
  },
  weightBadge: {
    fontSize: '0.75rem',
    background: 'var(--primary-glow)',
    border: '1px solid rgba(99,102,241,0.2)',
    padding: '3px 8px',
    borderRadius: '99px',
    fontWeight: '600',
    color: 'var(--primary)',
  },
  slidersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  sliderItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sliderLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sliderLabel: {
    display: 'block',
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  sliderDesc: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-dark)',
  },
  sliderPercent: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  sliderInput: {
    marginTop: '2px',
  },
  addBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  vendorInputsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '280px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  vendorInputItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
  },
  vendorInputName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  vendorInputMetrics: {
    fontSize: '0.72rem',
    color: 'var(--text-dark)',
    marginTop: '2px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dark)',
    cursor: 'pointer',
    transition: 'color 0.2s',
    padding: '4px',
  },
  spotlightCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  spotlightBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '12px',
  },
  spotlightHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  spotlightPreTitle: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#fbbf24',
    letterSpacing: '0.08em',
    fontWeight: '700',
  },
  spotlightTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    marginTop: '2px',
  },
  scoreCircle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--primary-glow)',
    border: '1.5px solid var(--primary)',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)',
  },
  scoreVal: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: '0.58rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginTop: '-2px',
  },
  spotlightSplit: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    alignItems: 'center',
  },
  spotlightLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  metricsLabelGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  metricSubItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metricSubLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
  },
  metricSubVal: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  reasonsBox: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  reasonsHeader: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    textTransform: 'uppercase',
  },
  reasonsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  reasonItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.78rem',
    color: '#e2e8f0',
  },
  radarChartCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: '8px',
    padding: '0 8px',
  },
  radarHeaderTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  radarSelect: {
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.75rem',
    padding: '3px 8px',
    outline: 'none',
    cursor: 'pointer',
  },
  svgWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whitePanel: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '2rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  sectionHeading: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: 0,
  },
  rankingsTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    borderBottom: '2px solid #f1f5f9',
  },
  tableHeaderCell: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  tableBodyRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'all 0.2s',
  },
  tableCell: {
    padding: '12px',
    fontSize: '0.82rem',
    color: '#334155',
  },
  infoFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.72rem',
    color: '#64748b',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  
  // Add Form details styles
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '10px',
    marginBottom: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  formLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  formInput: {
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: '#ffffff',
    padding: '6px 8px',
    fontSize: '0.8rem',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  cancelBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    color: '#ffffff',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  submitBtn: {
    background: 'var(--primary)',
    border: 'none',
    color: '#ffffff',
    padding: '5px 14px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  }
};
