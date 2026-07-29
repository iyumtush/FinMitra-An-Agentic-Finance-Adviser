import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { categoryApi } from '../../api/categoryApi';
import './CategorySpendsBar.css';

const DEFAULT_COLOR_MAP = {
  'Rent': '#A16207',
  'Food': '#059669',
  'Food, Beverages and Groceries': '#0284C7',
  'Health': '#10B981',
  'To People': '#F43F5E',
  'Travel & Transport': '#F59E0B',
  'Transport': '#F59E0B',
  'Online Shopping': '#8B5CF6',
  'Shopping': '#8B5CF6',
  'Utilities': '#EC4899',
  'Entertainment': '#6366F1',
  'Salary': '#00E676'
};

// Generate deterministic vibrant HSL color for any dynamic category
function getCategoryColor(name, customMap) {
  if (customMap && customMap[name]) return customMap[name];
  if (DEFAULT_COLOR_MAP[name]) return DEFAULT_COLOR_MAP[name];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 75%, 50%)`;
}

export default function CategorySpendsBar({ categoryTotals, customCategories, onCategoryAdded }) {
  const [showModal, setShowModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#00E676');
  const [errorMsg, setErrorMsg] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Map Custom Categories colors
  const customColorMap = {};
  if (customCategories && Array.isArray(customCategories)) {
    customCategories.forEach(c => {
      customColorMap[c.name] = c.color;
    });
  }

  // Calculate Total Expense
  const totalExpense = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  // Filter ONLY categories with > 0 actual expense, sorted strictly by HIGHEST EXPENSE FIRST
  const sortedCategories = Object.keys(categoryTotals)
    .map(name => ({
      name,
      amount: Number(categoryTotals[name] || 0),
      pct: totalExpense > 0 ? (Number(categoryTotals[name] || 0) / totalExpense) * 100 : 0,
      color: getCategoryColor(name, customColorMap)
    }))
    .filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount); // Higher expense strictly at top

  const displayedCategories = showAll ? sortedCategories : sortedCategories.slice(0, 5);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setErrorMsg('');

    try {
      const created = await categoryApi.createCategory({
        name: newCatName.trim(),
        color: newCatColor
      });

      if (onCategoryAdded) onCategoryAdded(created);
      setNewCatName('');
      setShowModal(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create category');
    }
  };

  return (
    <div className="fin-card category-spends-card">
      <div className="card-header-flex">
        <h3 className="card-title">Top Categories</h3>
        <button className="btn-icon-pill" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Multi-Segmented Horizontal Progress Bar */}
      <div className="segmented-bar-container">
        {sortedCategories.length === 0 ? (
          <div className="empty-bar-segment"></div>
        ) : (
          sortedCategories.map((cat, idx) => (
            <div
              key={idx}
              className="bar-segment"
              style={{
                width: `${cat.pct}%`,
                backgroundColor: cat.color
              }}
              title={`${cat.name}: ₹${cat.amount.toLocaleString('en-IN')}`}
            ></div>
          ))
        )}
      </div>

      {/* Categories Sorted strictly by Highest Expense at Top */}
      <div className="categories-list">
        {displayedCategories.length === 0 ? (
          <div className="empty-text">No category expenses recorded yet. Log an expense to view top categories!</div>
        ) : (
          displayedCategories.map((cat, idx) => (
            <div key={idx} className="category-row">
              <div className="cat-name-badge">
                <span className="cat-dot" style={{ backgroundColor: cat.color }}></span>
                <span className="cat-label">{cat.name}</span>
              </div>
              <span className="cat-amount">₹{cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ))
        )}
      </div>

      {sortedCategories.length > 5 && (
        <button className="btn-view-all" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show top 5' : 'View all categories'}
        </button>
      )}

      {/* Create Custom Category Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create Custom Category</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="modal-form">
              {errorMsg && <div className="error-badge">{errorMsg}</div>}

              <div className="input-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pets, Gaming, Investments" 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  required 
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Category Theme Color</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                  <input 
                    type="color" 
                    value={newCatColor} 
                    onChange={(e) => setNewCatColor(e.target.value)} 
                    style={{ width: '48px', height: '40px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{newCatColor}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary full-btn">Save Category to MySQL</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
