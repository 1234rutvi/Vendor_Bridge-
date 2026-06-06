import React, { useState } from 'react';
import { Plus, ArrowRight, Trash2, Search, HelpCircle, Code, Settings } from 'lucide-react';

export default function MappingRules() {
  const [search, setSearch] = useState('');
  const [rules, setRules] = useState([
    { id: 1, vendorField: 'sku_id', odooField: 'default_code', dataType: 'String (SKU)', active: true, desc: 'Maps vendor unique sku identifier to Odoo default internal reference.' },
    { id: 2, vendorField: 'price_usd', odooField: 'list_price', dataType: 'Float (Decimal)', active: true, desc: 'Converts vendor price into decimal list price in main pricelist.' },
    { id: 3, vendorField: 'inventory_count', odooField: 'qty_available', dataType: 'Integer (Qty)', active: true, desc: 'Maps physical warehouse inventory count to Odoo quantity available.' },
    { id: 4, vendorField: 'item_description', odooField: 'description_sale', dataType: 'Text (Rich text)', active: false, desc: 'Synchronizes product retail catalog explanation.' },
    { id: 5, vendorField: 'barcode_ean13', odooField: 'barcode', dataType: 'String (EAN13)', active: true, desc: 'Maps international standard EAN barcode to Odoo barcode.' }
  ]);

  const [newRule, setNewRule] = useState({
    vendorField: '',
    odooField: 'default_code',
    dataType: 'String (SKU)',
    desc: ''
  });

  const odooOptions = [
    { value: 'default_code', label: 'default_code (Internal Reference)' },
    { value: 'list_price', label: 'list_price (Sales Price)' },
    { value: 'qty_available', label: 'qty_available (Quantity On Hand)' },
    { value: 'barcode', label: 'barcode (Barcode/EAN)' },
    { value: 'name', label: 'name (Product Template Name)' },
    { value: 'weight', label: 'weight (Product Weight)' },
    { value: 'description_sale', label: 'description_sale (Sales Description)' }
  ];

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.vendorField) {
      alert('Please enter a Vendor API Key attribute.');
      return;
    }

    const created = {
      id: Date.now(),
      vendorField: newRule.vendorField,
      odooField: newRule.odooField,
      dataType: newRule.dataType,
      active: true,
      desc: newRule.desc || `Custom mapping from ${newRule.vendorField} to Odoo ${newRule.odooField}.`
    };

    setRules(prev => [created, ...prev]);
    setNewRule({
      vendorField: '',
      odooField: 'default_code',
      dataType: 'String (SKU)',
      desc: ''
    });
  };

  const handleToggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleDeleteRule = (id) => {
    if (confirm('Are you sure you want to delete this SKU mapping rule?')) {
      setRules(prev => prev.filter(r => r.id !== id));
    }
  };

  const filteredRules = rules.filter(r => 
    r.vendorField.toLowerCase().includes(search.toLowerCase()) ||
    r.odooField.toLowerCase().includes(search.toLowerCase()) ||
    r.dataType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Field Mapping Rules</h2>
          <p style={styles.subtitle}>Define key schemas between incoming Vendor API objects and Odoo ERP database attributes.</p>
        </div>
      </header>

      <div style={styles.contentGrid}>
        {/* Left Side: Create Rule */}
        <div className="glass-panel" style={styles.formPanel}>
          <h3 style={styles.sectionTitle}>Add New Field Rule</h3>
          <form onSubmit={handleAddRule} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Vendor API Key Name</label>
              <div style={styles.inputIconContainer}>
                <Code size={14} style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. stock_level"
                  value={newRule.vendorField}
                  onChange={e => setNewRule({ ...newRule, vendorField: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                />
              </div>
              <span style={styles.helpText}>Enter the exact parameter key name returned by the Vendor API.</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Odoo target database field</label>
              <select
                value={newRule.odooField}
                onChange={e => setNewRule({ ...newRule, odooField: e.target.value })}
                className="form-input"
                style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
              >
                {odooOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data Parser Type</label>
              <select
                value={newRule.dataType}
                onChange={e => setNewRule({ ...newRule, dataType: e.target.value })}
                className="form-input"
                style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
              >
                <option value="String (SKU)">String (Standard text)</option>
                <option value="Float (Decimal)">Float / Decimal (e.g. 10.99)</option>
                <option value="Integer (Qty)">Integer (Whole number)</option>
                <option value="Boolean">Boolean (True/False)</option>
                <option value="Date (ISO)">Date (YYYY-MM-DD)</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description (Optional)</label>
              <textarea
                placeholder="Briefly explain this custom translation logic..."
                value={newRule.desc}
                onChange={e => setNewRule({ ...newRule, desc: e.target.value })}
                className="form-input"
                style={{ height: '80px', resize: 'none' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={16} /> Add Mapping Rule
            </button>
          </form>
        </div>

        {/* Right Side: Mapping Rules List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Bar */}
          <div className="glass-panel" style={styles.filterBar}>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search mapping rules..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', border: 'none', background: 'transparent' }}
              />
            </div>
            <div style={styles.rulesCount}>
              <span>{filteredRules.length} rules active</span>
            </div>
          </div>

          {/* Rules Grid */}
          <div style={styles.rulesList}>
            {filteredRules.map((rule) => (
              <div key={rule.id} className="glass-panel animate-fade-in" style={{ ...styles.ruleCard, opacity: rule.active ? 1 : 0.6 }}>
                <div style={styles.ruleTop}>
                  <div style={styles.mappingVisual}>
                    <code style={styles.codeVendor}>{rule.vendorField}</code>
                    <ArrowRight size={16} style={{ color: 'var(--text-dark)' }} />
                    <code style={styles.codeOdoo}>{rule.odooField}</code>
                  </div>
                  
                  <div style={styles.ruleActions}>
                    <label className="switch" style={{ transform: 'scale(0.85)' }}>
                      <input
                        type="checkbox"
                        checked={rule.active}
                        onChange={() => handleToggleRule(rule.id)}
                      />
                      <span className="slider"></span>
                    </label>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="btn btn-secondary"
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={styles.ruleInfo}>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>
                    {rule.dataType}
                  </span>
                  <p style={styles.ruleDesc}>{rule.desc}</p>
                </div>
              </div>
            ))}

            {filteredRules.length === 0 && (
              <div className="glass-panel" style={styles.emptyState}>
                <HelpCircle size={28} color="var(--text-dark)" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                  No mapping rules match your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
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
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '340px 1fr',
    gap: '1.5rem',
    alignItems: 'flex-start',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
    },
  },
  formPanel: {
    padding: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: '1.2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    marginBottom: '6px',
  },
  inputIconContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-dark)',
  },
  helpText: {
    fontSize: '0.7rem',
    color: 'var(--text-dark)',
    marginTop: '4px',
  },
  filterBar: {
    padding: '0.6rem 1.2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    color: 'var(--text-dark)',
  },
  rulesCount: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  rulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  ruleCard: {
    padding: '1.2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    transition: 'var(--transition-smooth)',
  },
  ruleTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mappingVisual: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  codeVendor: {
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#818cf8',
    padding: '4px 8px',
    fontSize: '0.85rem',
    borderRadius: '6px',
    border: '1px solid rgba(99, 102, 241, 0.15)',
  },
  codeOdoo: {
    background: 'rgba(168, 85, 247, 0.1)',
    color: '#c084fc',
    padding: '4px 8px',
    fontSize: '0.85rem',
    borderRadius: '6px',
    border: '1px solid rgba(168, 85, 247, 0.15)',
  },
  ruleActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  deleteBtn: {
    padding: '6px',
    borderColor: 'transparent',
    color: 'var(--text-dark)',
    background: 'transparent',
    '&:hover': {
      color: 'var(--danger)',
      background: 'var(--danger-glow)',
    },
  },
  ruleInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  ruleDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  emptyState: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
};
