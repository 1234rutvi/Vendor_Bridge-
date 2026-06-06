import React, { useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  RefreshCw,
  Trash2,
  Globe,
  Link2,
  Shield,
  X,
  Check,
  Loader2,
  Phone,
  Building2,
  Hash,
  AlertTriangle
} from 'lucide-react';

export default function VendorList({ vendors, setVendors, triggerVendorSync }) {
  // --- View States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Active', 'Pending', 'Blocked'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null); // Vendor object for Detail view
  const [syncingId, setSyncingId] = useState(null);

  // --- New Vendor Form State ---
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'Furniture',
    gstNo: '',
    contactNo: '',
    status: 'Active',
    platform: 'Custom REST',
    endpoint: '',
    apiKey: '',
    productsCount: 0
  });

  // --- Notification Toasts ---
  const [toasts, setToasts] = useState([]);
  const triggerToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // --- Dynamic Tab Counts ---
  const totalCount = vendors.length;
  const activeCount = vendors.filter(v => v.status === 'Active').length;
  const pendingCount = vendors.filter(v => v.status === 'Pending').length;
  const blockedCount = vendors.filter(v => v.status === 'Blocked').length;

  // --- Filtering Logic ---
  const filteredVendors = vendors.filter(v => {
    // Search filter
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.gstNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.contactNo && v.contactNo.toLowerCase().includes(searchTerm.toLowerCase()));

    // Tab filter
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && v.status.toLowerCase() === activeTab.toLowerCase();
  });

  // --- Sync Trigger handler ---
  const handleSyncIndividual = async (id, name) => {
    setSyncingId(id);
    triggerToast(`Initiating manual synchronization for ${name}...`, 'info');
    try {
      await triggerVendorSync(id, name);
      triggerToast(`Successfully synchronized catalog for ${name}!`, 'success');

      // Update local detailed view if open
      if (selectedVendor && selectedVendor.id === id) {
        setSelectedVendor(prev => ({
          ...prev,
          lastSync: 'Just now',
          productsCount: prev.productsCount + Math.floor(Math.random() * 15) + 5
        }));
      }
    } catch (err) {
      triggerToast(`Synchronization failed for ${name}.`, 'error');
    } finally {
      setSyncingId(false);
    }
  };

  // --- Delete Connection handler ---
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove vendor "${name}" connection?`)) {
      setVendors(prev => prev.filter(v => v.id !== id));
      triggerToast(`Removed connection for ${name}.`, 'success');
      if (selectedVendor && selectedVendor.id === id) {
        setSelectedVendor(null);
      }
    }
  };

  // --- Add Vendor Submit handler ---
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.gstNo || !newVendor.contactNo) {
      triggerToast('Please provide Name, GST number, and Contact number.', 'error');
      return;
    }

    const created = {
      id: Date.now(),
      name: newVendor.name,
      category: newVendor.category,
      gstNo: newVendor.gstNo,
      contactNo: newVendor.contactNo,
      status: newVendor.status,
      isActive: newVendor.status !== 'Blocked',
      platform: newVendor.platform,
      endpoint: newVendor.endpoint || 'https://api.vendor.com/v1',
      lastSync: 'Never synced',
      productsCount: 0
    };

    setVendors(prev => [created, ...prev]);
    triggerToast(`Registered new vendor connection: ${newVendor.name}`, 'success');

    // Reset Form
    setNewVendor({
      name: '',
      category: 'Furniture',
      gstNo: '',
      contactNo: '',
      status: 'Active',
      platform: 'Custom REST',
      endpoint: '',
      apiKey: '',
      productsCount: 0
    });
    setShowAddModal(false);
  };

  // --- Helper for Status Colors ---
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active':
        return styles.badgeActive;
      case 'Pending':
        return styles.badgePending;
      case 'Blocked':
        return styles.badgeBlocked;
      default:
        return styles.badgePending;
    }
  };

  return (
    <div className="vendors-wrapper animate-fade-in" style={styles.container}>
      <style>{customCSS}</style>

      {/* Real-time Alerts Portal */}
      <div style={styles.toastContainer}>
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-alert toast-${toast.type} animate-slide-in`} style={styles.toastItem}>
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'info' && <RefreshCw size={16} className="animate-spin" />}
            {toast.type === 'error' && <AlertTriangle size={16} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Screen Title Header */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Vendors</h2>
          <p style={styles.subtitle}>Manage supplier profiles and registrations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={styles.addBtn}
        >
          <Plus size={16} />
          <span> Add Vendor</span>
        </button>
      </header>

      {/* Curved Search Bar */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBarWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search bar ...... search by name, gst number, category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs matching Curved Pill design */}
      <div style={styles.tabsContainer}>
        {[
          { key: 'All', label: `All (${totalCount})` },
          { key: 'Active', label: `active (${activeCount})` },
          { key: 'Pending', label: `Pending (${pendingCount})` },
          { key: 'Blocked', label: `Blocked (${blockedCount})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.key ? styles.tabBtnActive : {})
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Grid container */}
      <div className="glass-panel vendors-table-card" style={styles.tableCard}>
        <div style={styles.tableResponsiveContainer}>
          <table style={styles.vendorsTable}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th, width: '22%' }}>Vendor Name</th>
                <th style={{ ...styles.th, width: '15%' }}>Category</th>
                <th style={{ ...styles.th, width: '18%' }}>GST no.</th>
                <th style={{ ...styles.th, width: '18%' }}>contact no.</th>
                <th style={{ ...styles.th, width: '12%' }}>Status</th>
                <th style={{ ...styles.th, width: '15%', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map(vendor => (
                <tr key={vendor.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#ffffff' }}>
                    {vendor.name}
                  </td>
                  <td style={styles.td}>{vendor.category}</td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {vendor.gstNo}
                  </td>
                  <td style={styles.td}>{vendor.contactNo}</td>
                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(vendor.status)}>
                      {vendor.status === 'Active' ? 'Active' : vendor.status}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedVendor(vendor)}
                      className="btn btn-secondary action-view-btn"
                      style={styles.viewBtn}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan="6" style={styles.emptyTableText}>
                    No vendors found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Layout Border Line */}
      <div style={styles.bottomBorderLine} />

      {/* 1. VIEW VENDOR DETAIL GLASSMODAL */}
      {selectedVendor && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.detailModal}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="var(--primary)" />
                <h3 style={styles.modalHeaderTitle}>{selectedVendor.name} Profile</h3>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelectedVendor(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={styles.detailGrid}>
              {/* Profile details */}
              <div className="detail-section-card" style={styles.detailSection}>
                <h4 style={styles.detailSectionTitle}>Supplier Details</h4>

                <div style={styles.infoRow}>
                  <Building2 size={14} style={{ color: 'var(--text-dark)' }} />
                  <div>
                    <span style={styles.infoLabel}>Category</span>
                    <span style={styles.infoValue}>{selectedVendor.category}</span>
                  </div>
                </div>

                <div style={styles.infoRow}>
                  <Hash size={14} style={{ color: 'var(--text-dark)' }} />
                  <div>
                    <span style={styles.infoLabel}>GST Number</span>
                    <span style={styles.infoValue} className="mono-text">{selectedVendor.gstNo}</span>
                  </div>
                </div>

                <div style={styles.infoRow}>
                  <Phone size={14} style={{ color: 'var(--text-dark)' }} />
                  <div>
                    <span style={styles.infoLabel}>Contact Info</span>
                    <span style={styles.infoValue}>{selectedVendor.contactNo}</span>
                  </div>
                </div>

                <div style={styles.infoRow}>
                  <Shield size={14} style={{ color: 'var(--text-dark)' }} />
                  <div>
                    <span style={styles.infoLabel}>Status</span>
                    <span style={getStatusBadgeStyle(selectedVendor.status)}>
                      {selectedVendor.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sync settings */}
              <div className="detail-section-card" style={styles.detailSection}>
                <h4 style={styles.detailSectionTitle}>API & Integration Mappings</h4>

                <div style={styles.infoRow}>
                  <Globe size={14} style={{ color: 'var(--text-dark)' }} />
                  <div>
                    <span style={styles.infoLabel}>Connection Platform</span>
                    <span style={styles.infoValue}>{selectedVendor.platform}</span>
                  </div>
                </div>

                <div style={styles.infoRow}>
                  <Link2 size={14} style={{ color: 'var(--text-dark)' }} />
                  <div>
                    <span style={styles.infoLabel}>Endpoint Access URL</span>
                    <span style={{ ...styles.infoValue, fontSize: '0.8rem', color: 'var(--primary)' }}>
                      {selectedVendor.endpoint}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div style={styles.statMiniBox}>
                    <span style={styles.miniLabel}>Mapped Items</span>
                    <span style={styles.miniValue}>{selectedVendor.productsCount} items</span>
                  </div>
                  <div style={styles.statMiniBox}>
                    <span style={styles.miniLabel}>Last Pull Sync</span>
                    <span style={styles.miniValue}>{selectedVendor.lastSync}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal actions footer */}
            <div style={styles.modalFooterActions}>
              <button
                onClick={() => handleSyncIndividual(selectedVendor.id, selectedVendor.name)}
                disabled={selectedVendor.status === 'Blocked' || syncingId !== null}
                className="btn btn-primary"
                style={{ gap: '6px' }}
              >
                {syncingId === selectedVendor.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                <span>Sync Integrations</span>
              </button>

              <button
                onClick={() => handleDelete(selectedVendor.id, selectedVendor.name)}
                className="btn btn-secondary"
                style={styles.deleteActionBtn}
              >
                <Trash2 size={14} />
                <span>Delete Supplier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD VENDOR SETUP OVERLAY MODAL */}
      {showAddModal && (
        <div style={styles.modalOverlayTop}>
          <div className="glass-panel animate-slide-down" style={styles.addFormModal}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="var(--primary)" />
                <h3 style={styles.modalHeaderTitle}>Add Vendor Connection</h3>
              </div>
              <button style={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={styles.formLayout}>
              <div style={styles.formGrid}>
                {/* Vendor Name */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Vendor Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Infra Supplies Pvt ltd"
                    value={newVendor.name}
                    onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
                  />
                </div>

                {/* Vendor Category */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Procurement Category</label>
                  <select
                    className="form-input"
                    style={styles.selectInput}
                    value={newVendor.category}
                    onChange={e => setNewVendor({ ...newVendor, category: e.target.value })}
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Constructions">Constructions</option>
                    <option value="IT">IT</option>
                    <option value="logistics">Logistics</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distribution">Distribution</option>
                    <option value="Retail">Retail</option>
                    <option value="Services">Services</option>
                  </select>
                </div>

                {/* GST Number */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>GSTIN Registration No. *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. 27AABCS1429BzO"
                    value={newVendor.gstNo}
                    onChange={e => setNewVendor({ ...newVendor, gstNo: e.target.value })}
                  />
                </div>

                {/* Contact Number */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contact Phone / Coordinates *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. +91 98250 12345 or XYZ Number"
                    value={newVendor.contactNo}
                    onChange={e => setNewVendor({ ...newVendor, contactNo: e.target.value })}
                  />
                </div>

                {/* Initial Status */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Initial Status</label>
                  <select
                    className="form-input"
                    style={styles.selectInput}
                    value={newVendor.status}
                    onChange={e => setNewVendor({ ...newVendor, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                {/* Connection platform */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>API Sync Platform</label>
                  <select
                    className="form-input"
                    style={styles.selectInput}
                    value={newVendor.platform}
                    onChange={e => setNewVendor({ ...newVendor, platform: e.target.value })}
                  >
                    <option value="Custom REST">Custom JSON-REST</option>
                    <option value="Shopify">Shopify Admin API</option>
                    <option value="Amazon">Amazon SP-API</option>
                    <option value="WooCommerce">WooCommerce REST</option>
                  </select>
                </div>

                {/* Integration Endpoint URL */}
                <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Integration Endpoint URL (Odoo Link)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://api.vendor.com/v1"
                    value={newVendor.endpoint}
                    onChange={e => setNewVendor({ ...newVendor, endpoint: e.target.value })}
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div style={styles.formActions}>
                <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                  <Check size={15} />
                  <span>Register Connection</span>
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Scoped custom CSS rules
const customCSS = `
  .toast-alert.toast-info {
    background: rgba(99, 102, 241, 0.12);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.25);
  }
  .toast-alert.toast-error {
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }
  
  .action-view-btn {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px !important;
    padding: 6px 16px !important;
    font-size: 0.85rem !important;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.03);
    transition: all 0.2s ease;
  }

  .action-view-btn:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(255, 255, 255, 0.25) !important;
    color: #ffffff !important;
  }

  .mono-text {
    font-family: monospace;
    letter-spacing: 0.03em;
  }

  .animate-slide-down {
    animation: slideDown 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
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
    // Defined standard layout
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
  addBtn: {
    background: 'none',
    border: '1.5px solid rgba(255, 255, 255, 0.85)',
    color: '#ffffff',
    padding: '8px 18px',
    borderRadius: '10px',
    fontWeight: 500,
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  searchContainer: {
    width: '100%',
  },
  searchBarWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '8px 16px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
  },
  searchIcon: {
    color: 'var(--text-dark)',
    marginRight: '10px',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    height: '24px',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dark)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '0.2rem',
  },
  tabBtn: {
    background: 'none',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-muted)',
    padding: '6px 18px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  tabBtnActive: {
    borderColor: '#ffffff',
    color: '#ffffff',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
  },
  tableResponsiveContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  vendorsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  th: {
    padding: '14px 18px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'background 0.2s ease',
  },
  td: {
    padding: '14px 18px',
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    verticalAlign: 'middle',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  emptyTableText: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-dark)',
    fontSize: '0.9rem',
  },
  bottomBorderLine: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    marginTop: '1.5rem',
  },
  badgeActive: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#34d399',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  badgePending: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#fbbf24',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  badgeBlocked: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#f87171',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },

  // Modal styling
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalOverlayTop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '60px 20px 20px 20px',
    overflowY: 'auto',
  },
  detailModal: {
    width: '100%',
    maxWidth: '650px',
    background: 'rgba(11, 12, 19, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  addFormModal: {
    width: '100%',
    maxWidth: '600px',
    background: 'rgba(11, 12, 19, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '12px',
  },
  modalHeaderTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dark)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  detailSection: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  detailSectionTitle: {
    fontSize: '0.88rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginBottom: '4px',
    fontWeight: 600,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  infoLabel: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    marginBottom: '2px',
  },
  infoValue: {
    fontSize: '0.88rem',
    color: '#ffffff',
    fontWeight: 500,
  },
  statMiniBox: {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    display: 'flex',
    flexDirection: 'column',
  },
  miniLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-dark)',
  },
  miniValue: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#ffffff',
    marginTop: '2px',
  },
  modalFooterActions: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '1.2rem',
  },
  deleteActionBtn: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
    color: 'var(--danger)',
    gap: '6px',
  },

  // Form layouts
  formLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  selectInput: {
    background: 'rgba(0, 0, 0, 0.4)',
    color: '#ffffff',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '1.2rem',
  }
};
