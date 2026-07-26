import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle2, X } from 'lucide-react';
import './BudgetView.css';

const initialBudgets = [
  { id: 1, category: 'Food', spent: 8300, limit: 6000 },
  { id: 2, category: 'Rent', spent: 10000, limit: 10000 },
  { id: 3, category: 'Transport', spent: 1800, limit: 2000 },
  { id: 4, category: 'Shopping', spent: 3400, limit: 2500 },
];

export default function BudgetView() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [showModal, setShowModal] = useState(false);
  
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');

  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (!limit) return;

    const numLimit = parseFloat(limit);
    const existing = budgets.find(b => b.category === category);

    if (existing) {
      setBudgets(budgets.map(b => b.category === category ? { ...b, limit: numLimit } : b));
    } else {
      setBudgets([...budgets, { id: Date.now(), category, spent: 0, limit: numLimit }]);
    }

    setLimit('');
    setShowModal(false);
  };

  return (
    <div className="budget-view-container">
      <div className="view-header">
        <h2 className="view-title">Monthly budgets</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Set Budget Limit
        </button>
      </div>

      <div className="budget-cards-grid">
        {budgets.map((b) => {
          const isOver = b.spent > b.limit;
          const pct = Math.min(100, (b.spent / b.limit) * 100);
          const diff = Math.abs(b.spent - b.limit);

          return (
            <div key={b.id} className="fin-card budget-card">
              <div className="budget-card-top">
                <span className="budget-cat-title">{b.category}</span>
                <span className="budget-cat-val">
                  ₹{b.spent.toLocaleString('en-IN')} / ₹{b.limit.toLocaleString('en-IN')}
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

      {/* Set Budget Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Set Monthly Budget</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="modal-form">
              <div className="input-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Food">Food</option>
                  <option value="Rent">Rent</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div className="input-group">
                <label>Monthly Limit (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 5000" 
                  value={limit} 
                  onChange={(e) => setLimit(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary full-btn">Save Budget Limit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
