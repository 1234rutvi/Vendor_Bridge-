import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  User, 
  DollarSign, 
  Building, 
  MessageSquare, 
  AlertTriangle, 
  ChevronRight, 
  Loader2, 
  Activity, 
  FileText,
  CornerDownRight
} from 'lucide-react';

export default function ApprovalsPage() {
  // --- Requisitions Database State ---
  const [requisitions, setRequisitions] = useState([
    { 
      id: 'REQ-2026-001', 
      title: 'Office Ergonomic Chairs Procurement', 
      requestor: 'Elena Rostova', 
      department: 'Procurement', 
      budget: 4500, 
      date: '2026-06-04',
      status: 'Officer Review', 
      timeline: [
        { step: 'Draft Created', actor: 'Elena Rostova', timestamp: '2026-06-04 09:30', remarks: 'Requisition submitted for office upgrading project Q2.' }
      ]
    },
    { 
      id: 'REQ-2026-002', 
      title: 'Core Database Servers Upgrade', 
      requestor: 'Sarah Jenkins', 
      department: 'IT', 
      budget: 35000, 
      date: '2026-06-05',
      status: 'Manager Approval', 
      timeline: [
        { step: 'Draft Created', actor: 'Sarah Jenkins', timestamp: '2026-06-05 10:15', remarks: 'Fulfilling infrastructure roadmap scale-up requirements.' },
        { step: 'Officer Review Signed Off', actor: 'System Officer', timestamp: '2026-06-05 14:20', remarks: 'Technical requirements verified. Fits budget allocations.' }
      ]
    },
    { 
      id: 'REQ-2026-003', 
      title: 'Global HQ Fiber Optic Cabling', 
      requestor: 'David Miller', 
      department: 'Infrastructure', 
      budget: 12500, 
      date: '2026-06-06',
      status: 'Manager Approval', 
      timeline: [
        { step: 'Draft Created', actor: 'David Miller', timestamp: '2026-06-06 08:00', remarks: 'Connecting blocks A and B via standard single-mode fibers.' },
        { step: 'Officer Review Signed Off', actor: 'System Officer', timestamp: '2026-06-06 10:45', remarks: 'Verified vendor mappings. Approving for manager sign-off.' }
      ]
    },
    { 
      id: 'REQ-2026-004', 
      title: 'Custom CRM Software Integration', 
      requestor: 'Alexander Wright', 
      department: 'Software Eng', 
      budget: 75000, 
      date: '2026-06-03',
      status: 'VP Approval', 
      timeline: [
        { step: 'Draft Created', actor: 'Alexander Wright', timestamp: '2026-06-03 11:00', remarks: 'Linking customer coordinates with Odoo CRM pipelines.' },
        { step: 'Officer Review Signed Off', actor: 'System Officer', timestamp: '2026-06-03 15:30', remarks: 'Compliance check passed.' },
        { step: 'Manager Approval Granted', actor: 'Manager DevOps', timestamp: '2026-06-04 11:20', remarks: 'Approved. Critical business tool upgrade.' }
      ]
    },
    { 
      id: 'REQ-2026-005', 
      title: 'Standard Stationary & Office Supplies', 
      requestor: 'Michael Chen', 
      department: 'Administration', 
      budget: 850, 
      date: '2026-06-06',
      status: 'Approved', 
      timeline: [
        { step: 'Draft Created', actor: 'Michael Chen', timestamp: '2026-06-06 09:00', remarks: 'Standard monthly pen, paper, and notepad replacements.' },
        { step: 'Approved', actor: 'System Officer', timestamp: '2026-06-06 11:00', remarks: 'Direct purchase approved. Under threshold.' }
      ]
    },
    { 
      id: 'REQ-2026-006', 
      title: 'Warehouse Forklift Purchasing', 
      requestor: 'John Doe', 
      department: 'Logistics', 
      budget: 55000, 
      date: '2026-06-02',
      status: 'Rejected', 
      timeline: [
        { step: 'Draft Created', actor: 'John Doe', timestamp: '2026-06-02 10:00', remarks: 'Requiring heavy lifting capacity in block C.' },
        { step: 'Rejected', actor: 'VP Operations', timestamp: '2026-06-03 14:00', remarks: 'Rejected. Postponed to next fiscal year budgets.' }
      ]
    },
    { 
      id: 'REQ-2026-007', 
      title: 'Marketing Campaign Visual Mockups', 
      requestor: 'Sophia Martinez', 
      department: 'Marketing', 
      budget: 6200, 
      date: '2026-06-05',
      status: 'Officer Review', 
      timeline: [
        { step: 'Draft Created', actor: 'Sophia Martinez', timestamp: '2026-06-05 16:00', remarks: 'Outsourcing visual models creation to external agencies.' }
      ]
    },
    { 
      id: 'REQ-2026-008', 
      title: 'AI Copilot Developer Licenses', 
      requestor: 'Liam O\'Connor', 
      department: 'Development', 
      budget: 24000, 
      date: '2026-06-06',
      status: 'Draft', 
      timeline: [
        { step: 'Draft Created', actor: 'Liam O\'Connor', timestamp: '2026-06-06 10:00', remarks: 'Developer subscriptions for 20 engineers.' }
      ]
    }
  ]);

  // --- View States ---
  const [selectedReqId, setSelectedReqId] = useState('REQ-2026-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Pending'); // 'All', 'Pending', 'Approved', 'Rejected'
  const [remarks, setRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Notification Toasts ---
  const [toasts, setToasts] = useState([]);
  const triggerToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const selectedReq = requisitions.find(r => r.id === selectedReqId);

  // --- Get Required Steps Based on Budget Thresholds ---
  const getWorkflowSteps = (budget) => {
    const base = ['Draft', 'Officer Review'];
    if (budget < 10000) {
      return [...base, 'Approved'];
    } else if (budget >= 10000 && budget < 50000) {
      return [...base, 'Manager Approval', 'Approved'];
    } else {
      return [...base, 'Manager Approval', 'VP Approval', 'Approved'];
    }
  };

  // --- Helper to format date ---
  const getFormattedDate = () => {
    const now = new Date();
    return now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');
  };

  // --- Workflow State Transitions ---
  const handleTransition = (action) => {
    if (!selectedReq) return;

    if (action === 'Reject' && !remarks.trim()) {
      triggerToast('Remarks are required to reject a requisition.', 'error');
      return;
    }

    setIsProcessing(true);
    triggerToast('Committing workflow transition to Odoo Bridge...', 'info');

    setTimeout(() => {
      setRequisitions(prev => prev.map(req => {
        if (req.id === selectedReq.id) {
          const steps = getWorkflowSteps(req.budget);
          
          if (action === 'Reject') {
            const newLog = {
              step: 'Rejected',
              actor: 'System Admin / Officer',
              timestamp: getFormattedDate(),
              remarks: remarks.trim() || 'No remarks provided.'
            };
            return {
              ...req,
              status: 'Rejected',
              timeline: [...req.timeline, newLog]
            };
          } else {
            // Approve action: Determine next state
            let nextStatus = 'Approved';
            const currentIdx = steps.indexOf(req.status);
            
            if (currentIdx !== -1 && currentIdx < steps.length - 1) {
              nextStatus = steps[currentIdx + 1];
            }

            const stepLabel = nextStatus === 'Approved' ? 'Approved' : `${req.status} Signed Off`;
            const newLog = {
              step: stepLabel,
              actor: 'System Admin / Officer',
              timestamp: getFormattedDate(),
              remarks: remarks.trim() || 'Approved.'
            };

            return {
              ...req,
              status: nextStatus,
              timeline: [...req.timeline, newLog]
            };
          }
        }
        return req;
      }));

      setIsProcessing(false);
      setRemarks('');
      triggerToast(action === 'Reject' ? 'Requisition Rejected.' : 'Workflow Step Approved.', 'success');
      
      // Keep selected or update local state details
      setTimeout(() => {
        setSelectedReqId(prev => prev);
      }, 100);

    }, 1500);
  };

  // --- Tabs Counters ---
  const counts = {
    All: requisitions.length,
    Pending: requisitions.filter(r => r.status !== 'Approved' && r.status !== 'Rejected').length,
    Approved: requisitions.filter(r => r.status === 'Approved').length,
    Rejected: requisitions.filter(r => r.status === 'Rejected').length
  };

  // --- Filter Logic ---
  const filteredList = requisitions.filter(req => {
    const matchesSearch = 
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Pending') {
      return matchesSearch && req.status !== 'Approved' && req.status !== 'Rejected';
    }
    return matchesSearch && req.status === activeTab;
  });

  return (
    <div className="approvals-wrapper animate-fade-in" style={styles.container}>
      <style>{customCSS}</style>

      {/* Real-time Alerts Portal */}
      <div style={styles.toastContainer}>
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-alert toast-${toast.type} animate-slide-in`} style={styles.toastItem}>
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'info' && <Loader2 size={16} className="animate-spin" />}
            {toast.type === 'error' && <X size={16} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Title Header */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Approval Workflows</h2>
          <p style={styles.subtitle}>Ensure structured procurement approvals, remarks history, and threshold tracking.</p>
        </div>
      </header>

      {/* Curved Search Input */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBarWrapper}>
          <Clock size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search bar ...... search by requisition ID, title, requestor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Curved Pills Tabs Filters */}
      <div style={styles.tabsContainer}>
        {[
          { key: 'Pending', label: `Pending (${counts.Pending})` },
          { key: 'Approved', label: `Approved (${counts.Approved})` },
          { key: 'Rejected', label: `Rejected (${counts.Rejected})` },
          { key: 'All', label: `All (${counts.All})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              // Focus first item of filtered list automatically if visible
              const list = requisitions.filter(r => {
                if (tab.key === 'All') return true;
                if (tab.key === 'Pending') return r.status !== 'Approved' && r.status !== 'Rejected';
                return r.status === tab.key;
              });
              if (list.length > 0) setSelectedReqId(list[0].id);
              else setSelectedReqId('');
            }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.key ? styles.tabBtnActive : {})
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Split Screen Master-Detail Layout */}
      <div style={styles.splitLayout}>
        
        {/* Left Side: Table List */}
        <div style={{
          flex: selectedReq ? '1 1 62%' : '1 1 100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: 0
        }}>
          <div className="glass-panel approvals-table-card" style={styles.tableCard}>
            <div style={styles.tableResponsiveContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.th, width: '15%' }}>REQ ID</th>
                    <th style={{ ...styles.th, width: '30%' }}>Requisition Title</th>
                    <th style={{ ...styles.th, width: '20%' }}>Requestor</th>
                    <th style={{ ...styles.th, width: '15%' }}>Budget</th>
                    <th style={{ ...styles.th, width: '20%' }}>Current Step</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map(req => {
                    const isSelected = selectedReqId === req.id;
                    return (
                      <tr 
                        key={req.id} 
                        onClick={() => setSelectedReqId(req.id)}
                        style={{
                          ...styles.tr,
                          background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                          borderColor: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        <td style={{ ...styles.td, fontWeight: '700', color: isSelected ? '#a5b4fc' : '#ffffff' }}>
                          {req.id}
                        </td>
                        <td style={{ ...styles.td, fontWeight: '500', color: '#ffffff' }}>
                          {req.title}
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{req.requestor}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>{req.department}</span>
                          </div>
                        </td>
                        <td style={{ ...styles.td, fontWeight: '600', color: '#ffffff' }}>
                          ${req.budget.toLocaleString()}
                        </td>
                        <td style={styles.td}>
                          <span className={`badge-workflow state-${req.status.toLowerCase().replace(' ', '-')}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan="5" style={styles.emptyText}>
                        No requisitions under this tab.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline detail box */}
        {selectedReq && (
          <div className="glass-panel animate-slide-down" style={styles.detailBoxPanel}>
            
            {/* Header info */}
            <div style={styles.detailHeader}>
              <div>
                <span style={styles.detailMetaLabel}>Procurement Requisition</span>
                <h3 style={styles.detailHeaderTitle}>{selectedReq.id}</h3>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelectedReqId('')}>
                <X size={16} />
              </button>
            </div>

            <div style={styles.detailScrollArea}>
              
              {/* Detailed coordinates */}
              <div style={styles.detailSectionCard}>
                <h4 style={styles.sectionTitle}>{selectedReq.title}</h4>
                <div style={styles.detailGrid}>
                  <div style={styles.gridItem}>
                    <User size={13} style={{ color: 'var(--text-dark)' }} />
                    <div>
                      <span style={styles.gridLabel}>Requestor</span>
                      <span style={styles.gridValue}>{selectedReq.requestor} ({selectedReq.department})</span>
                    </div>
                  </div>
                  <div style={styles.gridItem}>
                    <DollarSign size={13} style={{ color: 'var(--text-dark)' }} />
                    <div>
                      <span style={styles.gridLabel}>Budget Amount</span>
                      <span style={{ ...styles.gridValue, fontWeight: '700', color: 'var(--success)' }}>
                        ${selectedReq.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Stepper Timeline */}
              <div style={styles.detailSectionCard}>
                <h4 style={styles.sectionTitle}>Approval Progress Timeline</h4>
                <div style={styles.timelineContainer}>
                  {(() => {
                    const steps = getWorkflowSteps(selectedReq.budget);
                    const isRejected = selectedReq.status === 'Rejected';
                    
                    return steps.map((step, idx) => {
                      const currentIdx = steps.indexOf(selectedReq.status);
                      const isCompleted = isRejected ? false : (selectedReq.status === 'Approved' || currentIdx > idx);
                      const isActive = !isRejected && selectedReq.status === step;
                      const isNextPending = !isRejected && (currentIdx < idx);
                      
                      // Match step with timeline logs to fetch timestamps/remarks
                      const log = selectedReq.timeline.find(t => 
                        (step === 'Draft' && t.step.includes('Draft')) ||
                        (step === 'Officer Review' && t.step.includes('Officer')) ||
                        (step === 'Manager Approval' && t.step.includes('Manager')) ||
                        (step === 'VP Approval' && t.step.includes('VP')) ||
                        (step === 'Approved' && t.step.includes('Approved'))
                      );

                      return (
                        <div key={idx} style={styles.timelineNode}>
                          <div style={styles.timelineIndicatorColumn}>
                            <div 
                              style={{
                                ...styles.timelineNodeCircle,
                                borderColor: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : isActive ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                                color: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-dark)'
                              }}
                            >
                              {isCompleted ? <Check size={12} /> : isActive ? <Loader2 size={12} className="animate-spin" /> : idx + 1}
                            </div>
                            {idx < steps.length - 1 && (
                              <div 
                                style={{
                                  ...styles.timelineLine,
                                  background: isCompleted ? 'var(--success)' : 'rgba(255,255,255,0.06)'
                                }}
                              />
                            )}
                          </div>

                          <div style={styles.timelineContentColumn}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ 
                                ...styles.timelineStepName, 
                                color: isActive ? '#ffffff' : isCompleted ? 'var(--text-muted)' : 'var(--text-dark)',
                                fontWeight: isActive ? '600' : '500'
                              }}>
                                {step}
                              </span>
                              {log && (
                                <span style={styles.timelineTimeText}>{log.timestamp}</span>
                              )}
                            </div>

                            {log ? (
                              <div style={styles.timelineLogBox}>
                                <div style={styles.logActorRow}>
                                  <CornerDownRight size={10} style={{ color: 'var(--text-dark)' }} />
                                  <span>Actioned by: <strong>{log.actor}</strong></span>
                                </div>
                                <p style={styles.logRemarksText}>"{log.remarks}"</p>
                              </div>
                            ) : isActive ? (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-dark)', marginTop: '4px', fontStyle: 'italic' }}>
                                Awaiting sign-off remarks...
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    });
                  })()}

                  {/* If status is Rejected, append a red rejected node at the bottom */}
                  {selectedReq.status === 'Rejected' && (
                    <div style={styles.timelineNode}>
                      <div style={styles.timelineIndicatorColumn}>
                        <div 
                          style={{
                            ...styles.timelineNodeCircle,
                            borderColor: 'var(--danger)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--danger)'
                          }}
                        >
                          <X size={12} />
                        </div>
                      </div>
                      <div style={styles.timelineContentColumn}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ ...styles.timelineStepName, color: 'var(--danger)', fontWeight: '700' }}>
                            Workflow Rejected
                          </span>
                          <span style={styles.timelineTimeText}>
                            {selectedReq.timeline[selectedReq.timeline.length - 1].timestamp}
                          </span>
                        </div>
                        <div style={{ ...styles.timelineLogBox, borderLeftColor: 'var(--danger)' }}>
                          <div style={styles.logActorRow}>
                            <CornerDownRight size={10} style={{ color: 'var(--text-dark)' }} />
                            <span>Actioned by: <strong>{selectedReq.timeline[selectedReq.timeline.length - 1].actor}</strong></span>
                          </div>
                          <p style={styles.logRemarksText}>
                            "{selectedReq.timeline[selectedReq.timeline.length - 1].remarks}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Operations Input */}
              {selectedReq.status !== 'Approved' && selectedReq.status !== 'Rejected' && (
                <div style={styles.detailSectionCard}>
                  <h4 style={styles.sectionTitle}>Process Action Decision</h4>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Approval / Rejection Remarks *</label>
                    <textarea
                      placeholder="Add remarks or justification details..."
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      className="form-input"
                      style={{ minHeight: '80px', resize: 'vertical' }}
                      disabled={isProcessing}
                    />
                  </div>

                  <div style={styles.actionGridRow}>
                    <button
                      onClick={() => handleTransition('Approve')}
                      className="btn btn-primary approve-action"
                      disabled={isProcessing}
                      style={{ flex: 1, gap: '6px' }}
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      <span>Approve Step</span>
                    </button>
                    <button
                      onClick={() => handleTransition('Reject')}
                      className="btn btn-secondary reject-action"
                      disabled={isProcessing}
                      style={{ gap: '6px' }}
                    >
                      <X size={14} />
                      <span>Reject Requisition</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Scoped custom CSS rules
const customCSS = `
  .badge-workflow {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .badge-workflow.state-draft {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-dark);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .badge-workflow.state-officer-review {
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.2);
  }
  .badge-workflow.state-manager-approval {
    background: rgba(168, 85, 247, 0.1);
    color: #d8b4fe;
    border: 1px solid rgba(168, 85, 247, 0.2);
  }
  .badge-workflow.state-vp-approval {
    background: rgba(245, 158, 11, 0.1);
    color: #fde047;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
  .badge-workflow.state-approved {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
  .badge-workflow.state-rejected {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .approve-action {
    background: rgba(16, 185, 129, 0.15) !important;
    border-color: rgba(16, 185, 129, 0.3) !important;
    color: #34d399 !important;
  }
  .approve-action:hover {
    background: var(--success) !important;
    color: #000000 !important;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
  }
  
  .reject-action {
    background: rgba(239, 68, 68, 0.05) !important;
    border-color: rgba(239, 68, 68, 0.15) !important;
    color: var(--danger) !important;
  }
  .reject-action:hover {
    background: var(--danger) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3) !important;
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
  splitLayout: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
    width: '100%',
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
  table: {
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
    transition: 'all 0.25s ease',
    cursor: 'pointer',
  },
  td: {
    padding: '14px 18px',
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    verticalAlign: 'middle',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  emptyText: {
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

  // Detail panel on the right side
  detailBoxPanel: {
    flex: '0 0 38%',
    background: 'var(--bg-card)',
    backdropFilter: 'var(--glass-blur)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
    position: 'sticky',
    top: '20px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '12px',
  },
  detailMetaLabel: {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailHeaderTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
    marginTop: '2px',
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
  detailScrollArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
    maxHeight: 'calc(100vh - 280px)',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  detailSectionCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    padding: '1rem 1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  sectionTitle: {
    fontSize: '0.88rem',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    fontWeight: 600,
    margin: 0,
  },
  detailGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  gridItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  gridLabel: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: '0.88rem',
    color: '#ffffff',
    fontWeight: 500,
    marginTop: '1px',
    display: 'block',
  },

  // Stepper Timeline CSS styles
  timelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '4px',
    marginTop: '4px',
  },
  timelineNode: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  timelineIndicatorColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    height: 'auto',
  },
  timelineNodeCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.72rem',
    fontWeight: 700,
    zIndex: 2,
  },
  timelineLine: {
    width: '2px',
    flexGrow: 1,
    minHeight: '40px',
    marginTop: '4px',
    marginBottom: '4px',
    zIndex: 1,
  },
  timelineContentColumn: {
    flex: 1,
    paddingBottom: '20px',
  },
  timelineStepName: {
    fontSize: '0.88rem',
  },
  timelineTimeText: {
    fontSize: '0.72rem',
    color: 'var(--text-dark)',
  },
  timelineLogBox: {
    background: 'rgba(0,0,0,0.15)',
    borderLeft: '2px solid var(--primary)',
    padding: '6px 10px',
    borderRadius: '0 6px 6px 0',
    marginTop: '6px',
  },
  logActorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginBottom: '2px',
  },
  logRemarksText: {
    fontSize: '0.8rem',
    color: '#ffffff',
    margin: 0,
    lineHeight: '1.4',
    fontStyle: 'italic',
  },

  // Form group actions
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
  actionGridRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  }
};
