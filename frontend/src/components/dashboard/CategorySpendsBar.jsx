import React, { useState } from 'react';
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

export default function CategorySpendsBar({ categoryTotals, customCategories }) {
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

  return (
    <div className="fin-card category-spends-card">
      <div className="card-header-flex">
        <h3 className="card-title">Top Categories</h3>
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
    </div>
  );
}
