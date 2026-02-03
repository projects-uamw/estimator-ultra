import React, { useState } from 'react';
import {
  ClipboardList,
  Layers,
  Settings as SettingsIcon,
  FileText,
  Plus,
  Trash2,
  Info,
  Download,
  Upload,
  FileDown,
  Users as UsersIcon,
  User,
  History,
  BarChart3,
  Save,
  ExternalLink,
  Table
} from 'lucide-react';
import { useEstimator } from './context/EstimatorContext';
import { formatCurrency, formatPercent } from './utils/calculations';
import { exportToPDF, exportToCSV } from './utils/fileUtils';

// Sub-components
const UserManagement = () => {
  const { users, setUsers, currentUserId, setCurrentUserId } = useEstimator();
  const [newUser, setNewUser] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editValue, setEditValue] = useState('');

  const addUser = () => {
    if (newUser.trim()) {
      setUsers([...users, newUser.trim()]);
      setNewUser('');
    }
  };

  const removeUser = (u) => {
    if (users.length > 1) {
      setUsers(users.filter(user => user !== u));
      if (currentUserId === u) setCurrentUserId(users.find(user => user !== u));
    }
  };

  const startEdit = (u) => {
    setEditingUser(u);
    setEditValue(u);
  };

  const saveEdit = () => {
    if (editValue.trim() && editingUser) {
      const newUsers = users.map(u => u === editingUser ? editValue.trim() : u);
      setUsers(newUsers);
      if (currentUserId === editingUser) setCurrentUserId(editValue.trim());
      setEditingUser(null);
    }
  };

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>Salesperson Management</h3>
        <p className="text-muted mb-4">Select, edit or remove salespeople. Active selection will be used for PDF reports.</p>
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: '1fr' }}>
          {(!users || users.length === 0) ? (
            <div className="text-center p-8 text-muted border border-dashed rounded-lg">
              No se han encontrado vendedores. Por favor, agregue uno a la derecha. / No salespeople found. Add one on the right.
            </div>
          ) : users.map(u => (
            <div
              key={u}
              className={`card flex justify-between items-center cursor-pointer p-4 ${currentUserId === u ? 'glass' : ''}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: currentUserId === u ? 'var(--primary)' : 'var(--border)', padding: '1rem' }}
              onClick={() => setCurrentUserId(u)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <User size={18} color={currentUserId === u ? 'var(--primary)' : 'var(--text-muted)'} />
                {editingUser === u ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--primary)', padding: 0 }}
                  />
                ) : (
                  <span style={{ fontWeight: currentUserId === u ? 700 : 400 }}>{u}</span>
                )}
              </div>
              <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={(e) => { e.stopPropagation(); startEdit(u); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)' }}>
                  <ClipboardList size={16} />
                </button>
                {users.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); removeUser(u); }} style={{ background: 'transparent', border: 'none', color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Add New Salesperson</h3>
        <div className="label-group mt-4">
          <label>Full Name</label>
          <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
            <input value={newUser} onChange={(e) => setNewUser(e.target.value)} placeholder="e.g. Maria Gonzalez" />
            <button className="btn btn-primary" onClick={addUser}><Plus size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
const HistoryView = () => {
  const { history, setHistory, setProjectInfo, setMaterials, setOptions, setActiveTab } = useEstimator();

  const loadEstimate = (entry) => {
    setProjectInfo(entry.projectInfo);
    setMaterials(entry.materials);
    setOptions(entry.options);
    setActiveTab('project');
  };

  const deleteEntry = (id) => {
    setHistory(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3>Historial de Estimados / Estimate History</h3>
        <p className="text-muted">Stored locally on this device</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center p-12 text-muted">
          No saved estimates found.
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr' }}>
          {history.map(entry => (
            <div key={entry.id} className="card flex justify-between items-center p-4 hover-glow" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div>
                <h4 className="m-0">{entry.projectInfo.projectName || 'Unnamed Project'}</h4>
                <div className="flex gap-4 text-sm text-muted mt-1">
                  <span>{entry.timestamp}</span>
                  <span>{entry.projectInfo.clientName}</span>
                  <span style={{ color: 'var(--accent-blue)' }}>{formatCurrency(entry.estimate.variants.fair.totalSellingPrice)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline p-2" onClick={() => loadEstimate(entry)} title="Load Estimate">
                  <ExternalLink size={18} />
                </button>
                <button className="btn btn-outline p-2 text-red" onClick={() => deleteEntry(entry.id)} style={{ color: '#ef4444' }} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectInfo = () => {
  const { projectInfo, setProjectInfo } = useEstimator();
  const handleChange = (e) => {
    setProjectInfo({ ...projectInfo, [e.target.name]: e.target.value });
  };

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>General Details</h3>
        <div className="label-group mt-4">
          <label>Project Name</label>
          <input name="projectName" value={projectInfo.projectName} onChange={handleChange} placeholder="e.g. Waterfront Railing" />
        </div>
        <div className="label-group">
          <label>Client Name</label>
          <input name="clientName" value={projectInfo.clientName} onChange={handleChange} placeholder="John Doe" />
        </div>
        <div className="label-group">
          <label>Project Address</label>
          <input name="address" value={projectInfo.address} onChange={handleChange} placeholder="123 Steel St, Miami, FL" />
        </div>
        <div className="grid grid-2">
          <div className="label-group">
            <label>Estimate #</label>
            <input name="estimateNumber" value={projectInfo.estimateNumber} onChange={handleChange} />
          </div>
          <div className="label-group">
            <label>Date</label>
            <input type="date" name="date" value={projectInfo.date} onChange={handleChange} />
          </div>
        </div>
        <div className="label-group">
          <label>Prepared By</label>
          <input name="preparedBy" value={projectInfo.preparedBy} onChange={handleChange} />
        </div>
      </div>
      <div className="card">
        <h3>Scope & Notes</h3>
        <div className="label-group mt-4">
          <label>Scope Summary</label>
          <textarea name="scopeSummary" value={projectInfo.scopeSummary} onChange={handleChange} rows="5" placeholder="Describe the project scope..." />
        </div>
        <div className="label-group">
          <label>Notes / Exclusions</label>
          <textarea name="notes" value={projectInfo.notes} onChange={handleChange} rows="4" placeholder="Important notes or exclusions..." />
        </div>
      </div>
    </div>
  );
};

const MaterialsEntry = () => {
  const { materials, setMaterials, isQuickMode, setIsQuickMode, quickMaterialTotal, setQuickMaterialTotal, settings } = useEstimator();

  const addLine = () => {
    setMaterials([...materials, { id: Date.now(), category: 'Steel', description: '', unit: 'LF', quantity: 0, unitCost: 0, notes: '' }]);
  };

  const removeLine = (id) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const updateLine = (id, field, value) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const subtotal = materials.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0);
  const waste = subtotal * (settings.materialWaste / 100);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{isQuickMode ? 'Quick Material Entry' : 'Detailed Materials List'}</h3>
        <div className="flex gap-2" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => exportToCSV(materials)}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-outline" onClick={() => setIsQuickMode(!isQuickMode)}>
            Switch to {isQuickMode ? 'Full' : 'Quick'} Mode
          </button>
          {!isQuickMode && (
            <button className="btn btn-primary" onClick={addLine}>
              <Plus size={16} /> Add Item
            </button>
          )}
        </div>
      </div>

      {isQuickMode ? (
        <div className="label-group">
          <label>Total Materials Subtotal ($)</label>
          <input
            type="number"
            value={quickMaterialTotal}
            onChange={(e) => setQuickMaterialTotal(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => (
                <tr key={m.id}>
                  <td>
                    <select value={m.category} onChange={(e) => updateLine(m.id, 'category', e.target.value)}>
                      <option>Aluminum</option>
                      <option>Steel</option>
                      <option>Glass</option>
                      <option>Hardware</option>
                      <option>Anchors</option>
                      <option>Concrete</option>
                      <option>Paint/Coating</option>
                      <option>Misc</option>
                    </select>
                  </td>
                  <td><input value={m.description} onChange={(e) => updateLine(m.id, 'description', e.target.value)} placeholder="Mat description" /></td>
                  <td style={{ width: '80px' }}>
                    <select value={m.unit} onChange={(e) => updateLine(m.id, 'unit', e.target.value)}>
                      <option>EA</option>
                      <option>FT</option>
                      <option>LF</option>
                      <option>SF</option>
                      <option>LB</option>
                      <option>SET</option>
                      <option>GAL</option>
                    </select>
                  </td>
                  <td style={{ width: '80px' }}><input type="number" value={m.quantity} onChange={(e) => updateLine(m.id, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                  <td style={{ width: '100px' }}><input type="number" value={m.unitCost} onChange={(e) => updateLine(m.id, 'unitCost', parseFloat(e.target.value) || 0)} /></td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(m.quantity * m.unitCost)}</td>
                  <td>
                    <button className="" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => removeLine(m.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No materials added yet. Click "Add Item" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 pt-4 border-t" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div className="grid grid-2">
          <div>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Subtotal of line items + waste.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '0.5rem' }}>Subtotal: <strong>{formatCurrency(isQuickMode ? quickMaterialTotal : subtotal)}</strong></div>
            <div>Waste ({settings.materialWaste}%): <strong>{formatCurrency(isQuickMode ? quickMaterialTotal * (settings.materialWaste / 100) : waste)}</strong></div>
            <div style={{ fontSize: '1.2rem', marginTop: '0.5rem', color: 'var(--primary)' }}>
              Total Materials w/ Waste: <strong>{formatCurrency(isQuickMode ? quickMaterialTotal * (1 + settings.materialWaste / 100) : subtotal + waste)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComplexityOptions = () => {
  const { options, setOptions, settings } = useEstimator();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions({ ...options, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="grid grid-2">
      <div className="card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} /> Project Scope & Complexity
        </h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Define the project scope and complexity. This determines which labor layers are calculated.
        </p>

        <div className="mb-6" style={{ marginBottom: '1.5rem' }}>
          <label className="block mb-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>Project Scope</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'full', label: 'Fabrication + Installation' },
              { id: 'fab', label: 'Fabrication Only' },
              { id: 'inst', label: 'Installation Only' },
              { id: 'service', label: 'Service / Other' }
            ].map(s => (
              <button
                key={s.id}
                className={`btn ${options.scope === s.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem' }}
                onClick={() => setOptions({ ...options, scope: s.id })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4" style={{ opacity: (options.scope === 'full' || options.scope === 'fab') ? 1 : 0.4, pointerEvents: (options.scope === 'full' || options.scope === 'fab') ? 'auto' : 'none' }}>
          <label className="block mb-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>Fabrication Complexity Level</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[1, 2, 3].map(v => (
              <label key={v} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: (options.scope === 'full' || options.scope === 'fab') ? 'pointer' : 'not-allowed',
                padding: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                flex: 1,
                minWidth: '100px',
                backgroundColor: options.fabComplexity == v ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                borderColor: options.fabComplexity == v ? 'var(--primary)' : 'var(--border)'
              }}>
                <input
                  type="radio"
                  name="fabComplexity"
                  value={v}
                  checked={options.fabComplexity == v}
                  onChange={handleChange}
                  disabled={!(options.scope === 'full' || options.scope === 'fab')}
                  style={{ width: 'auto' }}
                />
                <span style={{ fontWeight: 700 }}>Level {v}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{settings.fabMultipliers[v]}% Multiplier</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6" style={{ opacity: (options.scope === 'full' || options.scope === 'inst') ? 1 : 0.4, pointerEvents: (options.scope === 'full' || options.scope === 'inst') ? 'auto' : 'none' }}>
          <label className="block mb-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>Installation Complexity Level</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[1, 2, 3].map(v => (
              <label key={v} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: (options.scope === 'full' || options.scope === 'inst') ? 'pointer' : 'not-allowed',
                padding: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                flex: 1,
                minWidth: '100px',
                backgroundColor: options.instComplexity == v ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderColor: options.instComplexity == v ? 'var(--accent-blue)' : 'var(--border)'
              }}>
                <input
                  type="radio"
                  name="instComplexity"
                  value={v}
                  checked={options.instComplexity == v}
                  onChange={handleChange}
                  disabled={!(options.scope === 'full' || options.scope === 'inst')}
                  style={{ width: 'auto' }}
                />
                <span style={{ fontWeight: 700 }}>Level {v}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{settings.instMultipliers[v]}% Multiplier</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Adjustments & Add-ons</h3>
        <div className="mt-4">
          <div className="label-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
              Commission Override (%)
            </label>
            <input
              type="number"
              placeholder="Base Commission used if empty"
              value={options.commissionRateOverride || ''}
              onChange={(e) => setOptions({ ...options, commissionRateOverride: e.target.value === '' ? null : parseFloat(e.target.value) })}
            />
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Custom rate for this specific project.</p>
          </div>

          <div className="label-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
              Custom Equipment Rental Fee ($)
            </label>
            <input
              type="number"
              value={options.equipmentRental}
              onChange={(e) => setOptions({ ...options, equipmentRental: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Fixed cost added to production basis.</p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
            <input type="checkbox" name="hasSpecialFinish" checked={options.hasSpecialFinish} onChange={handleChange} style={{ width: 'auto' }} />
            Special Finish (Multiplier)
          </label>
          {options.hasSpecialFinish && (
            <div className="label-group">
              <select name="finishType" value={options.finishType} onChange={handleChange} style={{ marginBottom: '1rem' }}>
                <option value="">Default (from Settings)</option>
                <option value="Powder Coating">Powder Coating</option>
                <option value="Anodized">Anodized</option>
                <option value="Marine Grade / Premium">Marine Grade / Premium</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="hasRental" checked={options.hasRental} onChange={handleChange} style={{ width: 'auto' }} />
            Internal Rental Logic (%)
          </label>
          {options.hasRental && (
            <div className="label-group mt-2">
              <select name="rentalType" value={options.rentalType} onChange={handleChange}>
                <option value="">Default (from Settings)</option>
                <option value="Scissor Lift">Scissor Lift</option>
                <option value="Boom Lift">Boom Lift</option>
                <option value="Forklift">Forklift</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { settings, setSettings } = useEstimator();

  const handleMultChange = (type, level, val) => {
    setSettings({
      ...settings,
      [type]: { ...settings[type], [level]: parseFloat(val) || 0 }
    });
  };

  const handleMarginChange = (key, val) => {
    setSettings({
      ...settings,
      profitMargins: { ...settings.profitMargins, [key]: parseFloat(val) || 0 }
    });
  };

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>Material & Multipliers</h3>
        <div className="label-group mt-4">
          <label>Material Waste %</label>
          <input type="number" value={settings.materialWaste} onChange={(e) => setSettings({ ...settings, materialWaste: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className="label-group">
          <label>Fabrication Multipliers (%)</label>
          <div className="grid grid-3">
            {[1, 2, 3].map(v => (
              <div key={v}> L{v}: <input type="number" value={settings.fabMultipliers[v]} onChange={(e) => handleMultChange('fabMultipliers', v, e.target.value)} /></div>
            ))}
          </div>
        </div>
        <div className="label-group">
          <label>Installation Multipliers (%)</label>
          <div className="grid grid-3">
            {[1, 2, 3].map(v => (
              <div key={v}> L{v}: <input type="number" value={settings.instMultipliers[v]} onChange={(e) => handleMultChange('instMultipliers', v, e.target.value)} /></div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Profit, Commission & Taxes</h3>
        <div className="label-group mt-4">
          <label>Profit Margins (%)</label>
          <div className="grid grid-3">
            {Object.entries(settings.profitMargins).map(([key, val]) => (
              <div key={key} style={{ textTransform: 'capitalize' }}>
                {key}: <input type="number" value={val} onChange={(e) => handleMarginChange(key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <div className="label-group">
          <label>Tax Rate (%)</label>
          <input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })} />
        </div>
        <div className="label-group">
          <label>Tax Rate (%)</label>
          <input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })} />
        </div>
      </div>
    </div>
  );
};

const CalculatorOutput = () => {
  const { estimate, options, settings } = useEstimator();

  return (
    <div className="grid">
      <div className="grid grid-3">
        {Object.entries(estimate.variants).map(([key, data]) => (
          <div key={key} className={`card summary-card ${key === 'fair' ? 'glass' : ''}`} style={{ borderColor: key === 'fair' ? 'var(--primary)' : 'var(--border)' }}>
            <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{key} ({data.margin}%)</h4>
              <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                Profit: {data.profitPercentOfTotal.toFixed(1)}%
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '1rem 0' }}>{formatCurrency(data.totalSellingPrice)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Subtotal: {formatCurrency(data.sellingPriceBeforeTax)}<br />
              Commission ({data.commissionRate}%): <span style={{ color: 'var(--accent-blue)' }}>{formatCurrency(data.commissionAmount)}</span><br />
              Earnings ({data.margin}%): <span style={{ color: 'var(--primary)' }}>{formatCurrency(data.profitAmount)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Detailed Layer Breakdown (Full logic deduction)</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          This table shows exactly how each cost layer is calculated starting from your materials list.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <table className="breakdown-table">
            <thead>
              <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <th>Cost Layer</th>
                <th>Logic / Calculation</th>
                <th style={{ textAlign: 'right' }}>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Materials (Subtotal)</strong></td>
                <td>Sum of all line items</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(estimate.materialsSubtotal)}</td>
              </tr>
              <tr>
                <td><strong>Materials w/ Waste</strong></td>
                <td>Subtotal * (1 + {settings.materialWaste}%)</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(estimate.materialsWithWaste)}</td>
              </tr>
              {estimate.fabCost > 0 && (
                <tr>
                  <td><strong>Fabrication Cost</strong></td>
                  <td>Level {options.fabComplexity} ({settings.fabMultipliers[options.fabComplexity]}% of Mat w/ Waste)</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(estimate.fabCost)}</td>
                </tr>
              )}
              {estimate.instCost > 0 && (
                <tr>
                  <td><strong>Installation Cost</strong></td>
                  <td>Level {options.instComplexity} ({settings.instMultipliers[options.instComplexity]}% of Mat w/ Waste)</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(estimate.instCost)}</td>
                </tr>
              )}
              {estimate.finishAdder > 0 && (
                <tr>
                  <td><strong>Special Finish</strong></td>
                  <td>{options.finishType || 'Default'} ({settings.finishAdder.value}% of Mat w/ Waste)</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(estimate.finishAdder)}</td>
                </tr>
              )}
              {estimate.rentalAdder > 0 && (
                <tr>
                  <td><strong>Rental Equipment (Internal)</strong></td>
                  <td>{options.rentalType || 'Default'} ({settings.rentalAdder.value}% of Mat w/ Waste)</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(estimate.rentalAdder)}</td>
                </tr>
              )}
              <tr style={{ borderTop: '2px solid var(--border)', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                <td><strong>Total Production Cost (Baseline)</strong></td>
                <td>Sum of materials + labor + rentals</td>
                <td style={{ textAlign: 'right' }}><strong>{formatCurrency(estimate.subtotalCostBasis)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8" style={{ marginTop: '2rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Final Selling Price Deduction</h4>
            <div className="grid grid-3">
              {Object.entries(estimate.variants).map(([key, data]) => (
                <div key={key} className="card glass" style={{ padding: '1rem', border: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{key} Scenario</div>
                  <div style={{ margin: '0.5rem 0' }}>Formula: Cost / (1 - Margin - Comm)</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formatCurrency(data.totalSellingPrice)}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--accent-blue)' }}>
                    Commission: {formatCurrency(data.commissionAmount)} ({data.commissionRate}%)
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--primary)' }}>
                    Earnings: {formatCurrency(data.profitAmount)} ({data.margin}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('project');
  const { projectInfo, materials, estimate, options, settings, currentUserId, addToHistory } = useEstimator();

  const handleSave = () => {
    const data = { projectInfo, materials, options, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estimate_${projectInfo.estimateNumber}.json`;
    link.click();
  };

  const handlePDF = () => {
    exportToPDF(projectInfo, materials, estimate, options, settings, currentUserId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'project': return <ProjectInfo />;
      case 'materials': return <MaterialsEntry />;
      case 'complexity': return <ComplexityOptions />;
      case 'estimate': return <CalculatorOutput />;
      case 'users': return <UserManagement />;
      case 'history': return <HistoryView />;
      case 'settings': return <Settings />;
      default: return null;
    }
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="logo-container" style={{ background: '#fff', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="United Logo" style={{ height: '40px', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', margin: 0 }}>
              UNITED ESTIMATOR APP
            </h1>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <User size={14} /> Active User: <strong>{currentUserId}</strong>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => { addToHistory(estimate); alert('Guardado en historial / Saved to history!'); }}>
            <Save size={16} /> Save
          </button>
          <button className="btn btn-primary" onClick={handlePDF}>
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </header>

      <div className="tabs">
        <div className={`tab ${activeTab === 'project' ? 'active' : ''}`} onClick={() => setActiveTab('project')}>
          <ClipboardList size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Project
        </div>
        <div className={`tab ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>
          <Layers size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Materials
        </div>
        <div className={`tab ${activeTab === 'complexity' ? 'active' : ''}`} onClick={() => setActiveTab('complexity')}>
          <Info size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Complexity
        </div>
        <div className={`tab ${activeTab === 'estimate' ? 'active' : ''}`} onClick={() => setActiveTab('estimate')}>
          <FileText size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Estimate
        </div>
        <div className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <UsersIcon size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Users
        </div>
        <div className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <History size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> History
        </div>
        <div className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <SettingsIcon size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Settings
        </div>
      </div>

      <main>
        {renderContent()}
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        © 2026 UNITED ESTIMATOR APP • Professional Grade Logical Calculation
      </footer>
    </div>
  );
}
