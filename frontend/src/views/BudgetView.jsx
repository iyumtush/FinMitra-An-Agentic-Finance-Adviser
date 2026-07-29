import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { budgetApi } from '../api/budgetApi';
import './BudgetView.css';

export default function BudgetView() {
  const { token } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetApi.getBudgets(token);
      setBudgets(data);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBudgets();
    }
  }, [token]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!limit) return;

    try {
      const payload = {
        category,
        limitAmount: parseFloat(limit)
      };

      await budgetApi.setBudget(token, payload);
      await fetchBudgets();
      setLimit('');
      setShowModal(false);
    } catch (err) {
      alert('Failed to save budget limit');
    }
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
                  <span className="budget-cat-title">{b.category}</span>
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

              <button type="submit" className="btn btn-primary full-btn">Save Budget to MySQL</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
