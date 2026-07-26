import React from 'react';
import { Plus } from 'lucide-react';
import './CategoryBreakdown.css';

export default function CategoryBreakdown() {
  const categories = [
    { label: 'Housing & Rent', color: '#059669', amount: '$1,200' },
    { label: 'Groceries', color: '#00E676', amount: '$650' },
    { label: 'Utilities', color: '#06B6D4', amount: '$340' },
    { label: 'Shopping', color: '#E2E8F0', amount: '$550' },
    { label: 'Entertainment', color: '#64748B', amount: '$500' },
  ];

  return (
    <div className="fin-card category-breakdown-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Expense Categories</h3>
          <span className="card-subtitle">Breakdown for June 2026</span>
        </div>
        <button className="btn-icon-pill">
          Last 30 Days <Plus size={14} />
        </button>
      </div>

      <div className="gauge-container">
        <svg viewBox="0 0 200 110" className="gauge-svg">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1E2533"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Housing Segment */}
          <path
            d="M 20 100 A 80 80 0 0 1 45 50"
            fill="none"
            stroke="#059669"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Groceries Segment (Highlighted Neon Green) */}
          <path
            d="M 49 46 A 80 80 0 0 1 115 22"
            fill="none"
            stroke="#00E676"
            strokeWidth="18"
            strokeLinecap="round"
            filter="drop-shadow(0px 0px 8px rgba(0, 230, 118, 0.4))"
          />

          {/* Utilities Segment */}
          <path
            d="M 120 23 A 80 80 0 0 1 155 50"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Shopping & Entertainment Segment */}
          <path
            d="M 159 54 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="18"
            strokeLinecap="round"
          />
        </svg>

        <div className="gauge-center-text">
          <span className="gauge-label">Total Monthly Expenses</span>
          <span className="gauge-value">$3,240</span>
        </div>
      </div>

      <div className="category-legend">
        {categories.map((cat, idx) => (
          <div key={idx} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: cat.color }}></span>
            <span className="legend-text">{cat.label} ({cat.amount})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
