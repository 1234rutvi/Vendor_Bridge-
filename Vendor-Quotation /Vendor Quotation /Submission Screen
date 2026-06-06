import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  TrendingUp, 
  Award, 
  Calendar, 
  Truck, 
  DollarSign, 
  FileText, 
  Edit3, 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function QuotationsPage() {
  // --- View Control ---
  const [activeView, setActiveView] = useState('comparison'); // 'comparison' or 'submission'

  // --- Mock Active RFQs ---
  const activeRfqs = [
    { id: 'rfq-2026-008', title: 'office furniture procurement q2', deadline: '15 June 2026', itemsSummary: 'Ergonomic chair * 25, standing desk * 10 - category furniture' }
  ];
  const [selectedRfqId, setSelectedRfqId] = useState('rfq-2026-008');
  const activeRfq = activeRfqs.find(r => r.id === selectedRfqId);

  // --- Dynamic Quotations Comparison Database state ---
  const [quotations, setQuotations] = useState([
    {
      id: 'q-1',
      vendor: 'Office Hub',
      grandTotal: 185000,
      gstPercent: 18,
      deliveryDays: 10,
      rating: 4.5,
      paymentTerms: '30 days',
      isApproved: false
    },
    {
      id: 'q-2',
      vendor: 'TechCore LTD',
      grandTotal: 200010,
      gstPercent: 18,
      deliveryDays: 14,
      rating: 4.2,
      paymentTerms: '30 days',
      isApproved: false
    },
    {
      id: 'q-3',
      vendor: 'Office Need Co.',
      grandTotal: 214800,
      gstPercent: 18,
      deliveryDays: 7,
      rating: 3.8,
      paymentTerms: '15 days',
      isApproved: false
    }
  ]);

  // --- Vendor Submission Form States ---
  const [submissionVendor, setSubmissionVendor] = useState('TechCore LTD');
  const [lineItems, setLineItems] = useState([
    { id: 'item-1', name: 'Ergonomic chair', qty: 25, unitPrice: 3500, deliveryDays: 7 },
    { id: 'item-2', name: 'Tech Core LTD', qty: 10, unitPrice: 8200, deliveryDays: 14 }
  ]);
  const [gstInput, setGstInput] = useState(18);
  const [noteTerms, setNoteTerms] = useState('Payment terms: 20 days net...');
  
  // --- Interaction States ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApprovingId, setIsApprovingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // --- Toast Trigger Helper ---
  const triggerToast = (message, type = 'success') => {
    const newToast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3500);
  };

  // --- Restore Draft Check on Mount ---
  useEffect(() => {
    const draft = localStorage.getItem('vb_quote_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.lineItems) setLineItems(parsed.lineItems);
        if (parsed.gstInput) setGstInput(parsed.gstInput);
        if (parsed.noteTerms) setNoteTerms(parsed.noteTerms);
      } catch (e) {
        console.error('Could not parse draft');
      }
    }
  }, []);

  // --- Save Draft handler ---
  const handleSaveDraft = () => {
    const draftData = { lineItems, gstInput, noteTerms };
    localStorage.setItem('vb_quote_draft', JSON.stringify(draftData));
    triggerToast('Quotation draft saved successfully to local storage!', 'success');
  };

  // --- Submission Calculation Details ---
  const getSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.qty * (Number(item.unitPrice) || 0)), 0);
  };
  const subtotal = getSubtotal();
  const gstAmount = Math.round(subtotal * (Number(gstInput) / 100));
  const grandTotalVal = subtotal + gstAmount;

  // --- Edit Submission Table Fields ---
  const handleItemFieldChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // --- Submit Vendor Quotation ---
  const handleSubmitSubmission = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);

      // Add or Update quote in the comparison list
      const maxDeliveryDays = Math.max(...lineItems.map(item => Number(item.deliveryDays) || 0));
      const newQuote = {
        id: `q-${Date.now()}`,
        vendor: submissionVendor,
        grandTotal: grandTotalVal,
        gstPercent: Number(gstInput),
        deliveryDays: maxDeliveryDays,
        rating: submissionVendor === 'TechCore LTD' ? 4.2 : 4.4,
        paymentTerms: noteTerms.split('\n')[0] || '30 days',
        isApproved: false
      };

      setQuotations(prev => {
        // Filter out old quotes from the same vendor to prevent duplicates in list
        const filtered = prev.filter(q => q.vendor.toLowerCase() !== submissionVendor.toLowerCase());
        return [...filtered, newQuote];
      });

      triggerToast(`Quotation from ${submissionVendor} submitted successfully!`, 'success');
      localStorage.removeItem('vb_quote_draft'); // Clear draft
      setActiveView('comparison'); // Switch back to comparison panel to show new bid
    }, 1500);
  };

  // --- Approve Vendor Quote ---
  const handleApproveQuotation = (quoteId, vendorName) => {
    setIsApprovingId(quoteId);
    setTimeout(() => {
      setIsApprovingId(null);
      setQuotations(prev => prev.map(q => 
        q.id === quoteId ? { ...q, isApproved: true } : { ...q, isApproved: false }
      ));
      triggerToast(`Selected & Approved bid from ${vendorName}! Purchase Order issued.`, 'success');
    }, 1200);
  };

  // --- Lowest Price calculation for comparison matrix ---
  const getLowestPriceId = () => {
    if (quotations.length === 0) return null;
    let lowest = quotations[0];
    quotations.forEach(q => {
      if (q.grandTotal < lowest.grandTotal) {
        lowest = q;
      }
    });
    return lowest.id;
  };
  const lowestPriceId = getLowestPriceId();

  return (
    <div className="quotations-wrapper animate-fade-in" style={styles.container}>
      <style>{customCSS}</style>

      {/* Real-time alerts portal */}
      <div style={styles.toastContainer}>
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-alert toast-${toast.type} animate-slide-in`} style={styles.toastItem}>
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'info' && <RefreshCw size={16} className="animate-spin" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Title Header */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Quotation Management Center</h2>
          <p style={styles.subtitle}>Submit vendor bids or compare and approve quotations side-by-side.</p>
        </div>

        {/* View Toggle Panel Pills */}
        <div style={styles.togglePillContainer}>
          <button 
            onClick={() => setActiveView('comparison')}
            style={{ ...styles.togglePillBtn, ...(activeView === 'comparison' ? styles.togglePillActive : {}) }}
          >
            Quotation Comparison
          </button>
          <button 
            onClick={() => setActiveView('submission')}
            style={{ ...styles.togglePillBtn, ...(activeView === 'submission' ? styles.togglePillActive : {}) }}
          >
            Submit Quotations (Vendor)
          </button>
        </div>
      </header>

      {/* RFQ Reference Details Bar */}
      {activeRfq && (
        <div className="glass-panel rfq-details-summary-bar" style={styles.rfqSummaryBar}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={styles.rfqRefLabel}>Active Reference RFQ</span>
            <h3 style={styles.rfqRefTitle}>RFQ: {activeRfq.title}</h3>
          </div>
          <div style={styles.rfqSummaryCardSpec}>
            <strong>RFQ Summary:</strong> {activeRfq.itemsSummary}
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENTS */}

      {/* View 1: Quotation Comparison Screen */}
      {activeView === 'comparison' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel comparison-table-card" style={styles.comparisonContainer}>
            <div style={styles.sectionHeaderRow}>
              <div style={styles.sectionTitle}>Vendor Bid Comparison Matrix</div>
              <span className="badge badge-primary">{quotations.length} Quotation(s) Received</span>
            </div>

            <div style={styles.tableResponsiveContainer}>
              <table style={styles.comparisonTable}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, width: '20%' }}>Comparison Criteria</th>
                    {quotations.map(q => {
                      const isBest = q.id === lowestPriceId;
                      return (
                        <th 
                          key={q.id} 
                          style={{ 
                            ...styles.th, 
                            textAlign: 'center',
                            background: isBest ? 'rgba(16,185,129,0.04)' : 'transparent',
                            borderLeft: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none',
                            borderRight: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none'
                          }}
                        >
                          <div style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 'bold' }}>{q.vendor}</div>
                          {isBest && (
                            <span className="badge-best-value" style={styles.bestValueBadge}>
                              <Award size={10} style={{ marginRight: '3px' }} /> Best Price
                            </span>
                          )}
                          {q.isApproved && (
                            <span className="badge-approved-value" style={styles.approvedBadge}>
                              <Check size={10} style={{ marginRight: '3px' }} /> Approved
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 'bold', color: 'var(--text-main)' }}>Grand Total</td>
                    {quotations.map(q => {
                      const isBest = q.id === lowestPriceId;
                      return (
                        <td 
                          key={q.id} 
                          style={{ 
                            ...styles.td, 
                            textAlign: 'center',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            color: isBest ? '#34d399' : '#ffffff',
                            background: isBest ? 'rgba(16,185,129,0.04)' : 'transparent',
                            borderLeft: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none',
                            borderRight: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none'
                          }}
                        >
                          ${q.grandTotal.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                  
                  <tr style={styles.tr}>
                    <td style={styles.td}>GST %</td>
                    {quotations.map(q => {
                      const isBest = q.id === lowestPriceId;
                      return (
                        <td key={q.id} style={{ 
                          ...styles.td, 
                          textAlign: 'center',
                          background: isBest ? 'rgba(16,185,129,0.04)' : 'transparent',
                          borderLeft: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none',
                          borderRight: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none'
                        }}>
                          {q.gstPercent}%
                        </td>
                      );
                    })}
                  </tr>

                  <tr style={styles.tr}>
                    <td style={styles.td}>Delivery Days</td>
                    {quotations.map(q => {
                      const isBest = q.id === lowestPriceId;
                      return (
                        <td key={q.id} style={{ 
                          ...styles.td, 
                          textAlign: 'center',
                          fontWeight: '500',
                          background: isBest ? 'rgba(16,185,129,0.04)' : 'transparent',
                          borderLeft: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none',
                          borderRight: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <Truck size={13} color="var(--text-dark)" />
                            <span>{q.deliveryDays} Days</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  <tr style={styles.tr}>
                    <td style={styles.td}>Vendor Rating</td>
                    {quotations.map(q => {
                      const isBest = q.id === lowestPriceId;
                      return (
                        <td key={q.id} style={{ 
                          ...styles.td, 
                          textAlign: 'center',
                          color: 'var(--warning)',
                          fontWeight: '600',
                          background: isBest ? 'rgba(16,185,129,0.04)' : 'transparent',
                          borderLeft: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none',
                          borderRight: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none'
                        }}>
                          ⭐ {q.rating} / 5
                        </td>
                      );
                    })}
                  </tr>

                  <tr style={styles.tr}>
                    <td style={styles.td}>Payment Terms</td>
                    {quotations.map(q => {
                      const isBest = q.id === lowestPriceId;
                      return (
                        <td key={q.id} style={{ 
                          ...styles.td, 
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          background: isBest ? 'rgba(16,185,129,0.04)' : 'transparent',
                          borderLeft: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none',
                          borderRight: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none'
                        }}>
                          {q.paymentTerms}
                        </td>
                      );
                    })}
                  </tr>

                  <tr style={{ borderBottom: 'none' }}>
                    <td style={{ ...styles.td, border: 'none' }}></td>
                    {quotations.map(q => {
                      const isBest = q.id === lowestPriceId;
                      const isApproving = isApprovingId === q.id;
                      return (
                        <td 
                          key={q.id} 
                          style={{ 
                            ...styles.td, 
                            textAlign: 'center',
                            border: 'none',
                            background: isBest ? 'rgba(16,185,129,0.04)' : 'transparent',
                            borderLeft: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none',
                            borderRight: isBest ? '1px solid rgba(16,185,129,0.2)' : 'none',
                            padding: '20px 14px'
                          }}
                        >
                          {q.isApproved ? (
                            <span style={styles.poIssuedTag}>
                              <Check size={14} /> Approved & PO Issued
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveQuotation(q.id, q.vendor)}
                              disabled={isApprovingId !== null}
                              className={`comparison-action-btn ${isBest ? 'btn-best' : ''}`}
                              style={{
                                ...styles.approveBtn,
                                backgroundColor: isBest ? 'var(--success)' : 'rgba(255,255,255,0.03)',
                                borderColor: isBest ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                                color: isBest ? '#07080d' : '#ffffff'
                              }}
                            >
                              {isApproving ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : isBest ? (
                                'Select & Approve'
                              ) : (
                                'Select'
                              )}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Vendor Quotation Submission Screen */}
      {activeView === 'submission' && (
        <form onSubmit={handleSubmitSubmission} className="animate-fade-in" style={styles.submissionFormLayout}>
          
          {/* Main Submission Card */}
          <div className="glass-panel" style={styles.submissionFormCard}>
            <div style={styles.sectionHeaderRow}>
              <div style={styles.sectionTitle}>Submit Your Quotation</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={styles.label}>Vendor Operator Identity:</span>
                <select 
                  className="form-input" 
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#ffffff', width: '200px', padding: '6px 10px' }}
                  value={submissionVendor}
                  onChange={e => setSubmissionVendor(e.target.value)}
                >
                  <option value="TechCore LTD">TechCore LTD</option>
                  <option value="Office Hub">Office Hub</option>
                  <option value="Office Need Co.">Office Need Co.</option>
                  <option value="Amazon US Marketplace">Amazon US Marketplace</option>
                </select>
              </div>
            </div>

            {/* Editable Item Table */}
            <div style={styles.tableResponsiveContainer}>
              <table style={styles.itemsTable}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Item Name / Specs</th>
                    <th style={styles.th}>Quantity Required</th>
                    <th style={styles.th}>Unit Price ($)</th>
                    <th style={styles.th}>Total Value</th>
                    <th style={styles.th}>Delivery (Days)</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map(item => {
                    const rowTotal = item.qty * (Number(item.unitPrice) || 0);
                    return (
                      <tr key={item.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: '500', color: '#ffffff' }}>{item.name}</td>
                        <td style={styles.td}>{item.qty}</td>
                        <td style={styles.td}>
                          <div style={styles.inputPrefixWrapper}>
                            <span style={styles.inputPrefix}>$</span>
                            <input 
                              type="number" 
                              className="form-input text-right" 
                              style={{ width: '100px', paddingLeft: '18px' }}
                              value={item.unitPrice}
                              onChange={e => handleItemFieldChange(item.id, 'unitPrice', e.target.value)}
                              required
                              min="0"
                            />
                          </div>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 'bold', color: '#ffffff' }}>
                          ${rowTotal.toLocaleString()}
                        </td>
                        <td style={styles.td}>
                          <input 
                            type="number" 
                            className="form-input text-right" 
                            style={{ width: '80px' }}
                            value={item.deliveryDays}
                            onChange={e => handleItemFieldChange(item.id, 'deliveryDays', e.target.value)}
                            required
                            min="1"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sub-inputs grid */}
            <div style={styles.submissionSubGrid}>
              
              {/* Left Column: Tax & Note */}
              <div style={styles.subGridLeft}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tax / GST %</label>
                  <div style={{ position: 'relative', width: '120px' }}>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ paddingRight: '25px' }}
                      value={gstInput}
                      onChange={e => setGstInput(Math.max(0, Number(e.target.value)))}
                      required
                    />
                    <span style={styles.inputSuffix}>%</span>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Note / Terms & Conditions</label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={noteTerms}
                    onChange={e => setNoteTerms(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column: Pricing Summary Card */}
              <div style={styles.subGridRight}>
                <div className="glass-panel totals-breakdown-card" style={styles.totalsCard}>
                  <div style={styles.totalsRow}>
                    <span style={styles.totalsLabel}>Subtotal</span>
                    <span style={styles.totalsValue}>${subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div style={styles.totalsRow}>
                    <span style={styles.totalsLabel}>GST ({gstInput}%)</span>
                    <span style={styles.totalsValue}>${gstAmount.toLocaleString()}</span>
                  </div>

                  <div style={styles.totalsDivider} />

                  <div style={{ ...styles.totalsRow, marginBottom: 0 }}>
                    <span style={{ ...styles.totalsLabel, fontSize: '1.05rem', color: '#ffffff', fontWeight: 'bold' }}>Grand Total</span>
                    <span style={styles.grandTotalText}>${grandTotalVal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Stepper Buttons */}
            <div style={styles.actionsFooter}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ gap: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                <span>{isSubmitting ? 'Submitting...' : 'Submit Quotation'}</span>
              </button>
              
              <button 
                type="button" 
                onClick={handleSaveDraft}
                className="btn btn-secondary" 
                style={{ gap: '6px' }}
                disabled={isSubmitting}
              >
                Save Draft
              </button>
            </div>

          </div>

        </form>
      )}

    </div>
  );
}

// Scoped custom CSS rules for quotations submission and comparison comparison page
const customCSS = `
  .badge-best-value {
    display: inline-flex;
    align-items: center;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #34d399;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    margin-top: 6px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .badge-approved-value {
    display: inline-flex;
    align-items: center;
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: #a5b4fc;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 99px;
    margin-top: 6px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .comparison-action-btn {
    width: 80%;
    max-width: 140px;
    border: 1.5px solid;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .comparison-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255,255,255,0.05);
  }

  .comparison-action-btn.btn-best:hover {
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .text-right {
    text-align: right;
  }
`;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  toastContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none',
  },
  toastItem: {
    // Defined in .toast-alert
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: '0.4rem',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  togglePillContainer: {
    display: 'flex',
    background: 'rgba(0,0,0,0.25)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  togglePillBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  togglePillActive: {
    background: 'rgba(255,255,255,0.06)',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  rfqSummaryBar: {
    padding: '1.2rem 1.8rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    background: 'rgba(16, 18, 27, 0.5)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rfqRefLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  rfqRefTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
  },
  rfqSummaryCardSpec: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    background: 'rgba(0,0,0,0.15)',
    padding: '6px 12px',
    borderRadius: '6px',
  },
  comparisonContainer: {
    padding: '2rem',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.2rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '12px',
  },
  sectionTitle: {
    fontSize: '1.15rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    margin: 0,
  },
  tableResponsiveContainer: {
    width: '100%',
    overflowX: 'auto',
    background: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '1rem',
  },
  comparisonTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  td: {
    padding: '14px',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    verticalAlign: 'middle',
  },
  bestValueBadge: {
    // defined in .badge-best-value
  },
  approvedBadge: {
    // defined in .badge-approved-value
  },
  approveBtn: {
    // defined in .comparison-action-btn
  },
  poIssuedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--success)',
    fontSize: '0.82rem',
    fontWeight: 'bold',
  },
  submissionFormLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  submissionFormCard: {
    padding: '2rem',
  },
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  inputPrefixWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputPrefix: {
    position: 'absolute',
    left: '8px',
    color: 'var(--text-dark)',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  submissionSubGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '2rem',
    marginTop: '1.5rem',
  },
  subGridLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  inputSuffix: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    color: 'var(--text-dark)',
    fontSize: '0.85rem',
  },
  subGridRight: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  totalsCard: {
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  totalsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  totalsLabel: {
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  totalsValue: {
    color: '#ffffff',
    fontWeight: 600,
  },
  totalsDivider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '4px 0',
  },
  grandTotalText: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionsFooter: {
    display: 'flex',
    gap: '12px',
    marginTop: '2rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '1.2rem',
  }
};
