import React from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, PiggyBank, Target } from 'lucide-react';
import './HeroBalance.css';

export default function HeroBalance({ balance = 42850.00, monthlyIncome = 8500, monthlyExpense = 3240, onOpenModal }) {
  const netSavings = monthlyIncome - monthlyExpense;

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val);

  return (
    <div className="hero-balance-card">
      <div className="hero-top-section">
        <div className="networth-box">
          <span className="hero-label">Total Net Worth</span>
          <h2 className="hero-amount">{formatCurrency(balance)}</h2>
        </div>

        <div className="monthly-stats-grid">
          <div className="stat-pill income">
            <div className="stat-icon-wrapper">
              <ArrowDownLeft size={16} />
            </div>
            <div className="stat-text">
              <span className="stat-label">Monthly Income</span>
              <span className="stat-value">{formatCurrency(monthlyIncome)}</span>
            </div>
          </div>

          <div className="stat-pill expense">
            <div className="stat-icon-wrapper">
              <ArrowUpRight size={16} />
            </div>
            <div className="stat-text">
              <span className="stat-label">Monthly Expense</span>
              <span className="stat-value">{formatCurrency(monthlyExpense)}</span>
            </div>
          </div>

          <div className="stat-pill savings">
            <div className="stat-icon-wrapper">
              <PiggyBank size={16} />
            </div>
            <div className="stat-text">
              <span className="stat-label">Net Monthly Savings</span>
              <span className="stat-value">{formatCurrency(netSavings)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-actions">
        <button className="btn btn-primary" onClick={() => onOpenModal && onOpenModal('EXPENSE')}>
          <Plus size={16} />
          Add Expense
        </button>
        <button className="btn btn-secondary" onClick={() => onOpenModal && onOpenModal('INCOME')}>
          <ArrowDownLeft size={16} />
          Add Income
        </button>
        <button className="btn btn-secondary" onClick={() => alert('Transfer modal opened')}>
          <ArrowUpRight size={16} />
          Transfer Money
        </button>
        <button className="btn btn-secondary" onClick={() => alert('Budget goal created')}>
          <Target size={16} />
          Set Budget Goal
        </button>
      </div>
    </div>
  );
}
