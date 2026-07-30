import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, CheckCircle2, X, RefreshCw, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { budgetApi } from '../api/budgetApi';
import { categoryApi } from '../api/categoryApi';
import './BudgetView.css';

const BUILT_IN_CATEGORIES = [
  'To People',
  'Health',
  'Food, Beverages and Groceries',
  'Travel & Transport',
  'Online Shopping',
  'Rent',
  'Utilities',
  'Entertainment',
  'Food',
  'Shopping',
  'Transport'
];

export default function BudgetView() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [categoryOption, setCategoryOption] = useState('Food, Beverages and Groceries');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState('#00E676');
  const [limit, setLimit] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bData, catData] = await Promise.all([
        budgetApi.getBudgets(),
        categoryApi.getCategories().catch(() => [])
      ]);
      setBudgets(bData);
      setCustomCategories(catData || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingBudget(null);
    setCategoryOption('Food, Beverages and Groceries');
    setCustomCategoryInput('');
    setLimit('');
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (b) => {
    setEditingBudget(b);
    setCategoryOption(b.category);
    setCustomCategoryInput('');
    setLimit(b.limitAmount.toString());
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!limit) return;
    setErrorMsg('');

    let finalCategory = categoryOption;

    try {
      if (categoryOption === '__CUSTOM__') {
        if (!customCategoryInput.trim()) {
          setErrorMsg('Please enter a custom category name');
          return;
        }

        try {
          const newCat = await categoryApi.createCategory({
            name: customCategoryInput.trim(),
            color: customCategoryColor
          });
          finalCategory = newCat.name;
          setCustomCategories([...customCategories, newCat]);
        } catch (catErr) {
          finalCategory = customCategoryInput.trim();
        }
      }

      const payload = {
        category: finalCategory,
        limitAmount: parseFloat(limit)
      };

      await budgetApi.setBudget(payload);
      await fetchData();
      setLimit('');
      setShowModal(false);
      setEditingBudget(null);
    } catch (err) {
      console.error('Save Budget Error:', err);
      const backendMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save budget limit';
      setErrorMsg(backendMsg);
    }
  };

  const customNames = customCategories.map(c => c.name);
  const allCategoryOptions = Array.from(new Set([...BUILT_IN_CATEGORIES, ...customNames]));

  return (
    <div className="budget-view-container">
      <div className="view-header">
        <h2 className="view-title">Monthly budgets</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          Set Budget Limit
        </button>
      </div>

      {loading ? (
        <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
          <RefreshCw size={24} className="spin-icon" /> Loading live budget data...
        </div>
      ) : budgets.length === 0 ? (
        <div className="fin-card empty-state" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No monthly budget limits set yet. Click "+ Set Budget Limit" to configure your first category limit!
        </div>
      ) : (
        <div className="budget-cards-grid">
          {budgets.map((b) => {
            const spent = Number(b.spentAmount || 0);
            const limitVal = Number(b.limitAmount || 0);
            const isOver = spent > limitVal;
            const pct = limitVal > 0 ? Math.min(100, (spent / limitVal) * 100) : 0;
            const diff = Math.abs(spent - limitVal);

            return (
              <div key={b.id || b.category} className="fin-card budget-card">
                <div className="budget-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="budget-cat-title">{b.category}</span>
                    <button 
                      onClick={() => openEditModal(b)} 
                      title="Edit Budget Limit"
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                  <span className="budget-cat-val">
                    ₹{spent.toLocaleString('en-IN')} / ₹{limitVal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar-bg">
                  <div 
                    className={`progress-bar-fill ${isOver ? 'over' : 'good'}`} 
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                {/* Alert Status Footer */}
                <div className="budget-card-bottom">
                  {isOver ? (
                    <span className="budget-status over">
                      <AlertCircle size={14} /> Over budget by ₹{diff.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="budget-status good">
                      <CheckCircle2 size={14} /> ₹{diff.toLocaleString('en-IN')} remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingBudget ? `Edit ${editingBudget.category} Budget` : 'Set Monthly Budget'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="modal-form">
              {errorMsg && (
                <div style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem' }}>
                  {errorMsg}
                </div>
              )}

              <div className="input-group">
                <label>Category</label>
                <select 
                  value={categoryOption} 
                  onChange={(e) => setCategoryOption(e.target.value)} 
                  disabled={!!editingBudget}
                >
                  {allCategoryOptions.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                  <option value="__CUSTOM__">✨ + Add Custom Category...</option>
                </select>
              </div>

              {categoryOption === '__CUSTOM__' && !editingBudget && (
                <div style={{ background: 'var(--badge-bg)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="input-group">
                    <label>New Custom Category Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pets, Gaming, Crypto" 
                      value={customCategoryInput} 
                      onChange={(e) => setCustomCategoryInput(e.target.value)} 
                      required 
                      autoFocus
                    />
                  </div>

                  <div className="input-group">
                    <label>Category Theme Color</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="color" 
                        value={customCategoryColor} 
                        onChange={(e) => setCustomCategoryColor(e.target.value)} 
                        style={{ width: '44px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{customCategoryColor}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Monthly Limit (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="e.g. 5000" 
                  value={limit} 
                  onChange={(e) => setLimit(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary full-btn">
                {editingBudget ? 'Update' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
