import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, PiggyBank, RefreshCw, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { transactionApi } from '../api/transactionApi';
import { categoryApi } from '../api/categoryApi';
import CategorySpendsBar from '../components/dashboard/CategorySpendsBar';
import './DashboardView.css';

export default function DashboardView({ onNavigateTab }) {
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('Current Month');
  const [activeFilterChip, setActiveFilterChip] = useState('All');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txData, catData] = await Promise.all([
        transactionApi.getTransactions(),
        categoryApi.getCategories()
      ]);
      setTransactions(txData);
      setCustomCategories(catData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryAdded = (newCategory) => {
    setCustomCategories([...customCategories, newCategory]);
  };

  // Compute Metrics Dynamically
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  transactions.forEach(t => {
    const amt = Number(t.amount || 0);
    const typeUpper = t.type ? t.type.toUpperCase() : 'EXPENSE';
    const cat = t.category || 'Other';

    if (typeUpper === 'INCOME') {
      totalIncome += amt;
    } else {
      totalExpense += amt;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    }
  });

  const savings = totalIncome - totalExpense;

  // Filtered Chart Data based on selected Chip
  const filteredTransactions = activeFilterChip === 'All'
    ? transactions.filter(t => (t.type || '').toUpperCase() === 'EXPENSE')
    : transactions.filter(t => (t.type || '').toUpperCase() === 'EXPENSE' && (t.category || '').equalsIgnoreCase(activeFilterChip));

  // Monthly trend chart dataset
  const monthlyTrendData = [
    { name: 'Week 1', Spend: totalExpense * 0.2 },
    { name: 'Week 2', Spend: totalExpense * 0.3 },
    { name: 'Week 3', Spend: totalExpense * 0.25 },
    { name: 'Week 4', Spend: totalExpense * 0.25 },
  ];

  const categoryChips = ['All', ...Object.keys(categoryTotals)];

  return (
    <div className="dashboard-view-container">
      {/* Top Header Bar matching Screenshot */}
      <div className="spends-hero-banner">
        <div className="hero-left">
          <span className="hero-sub">Spends this month</span>
          <h1 className="hero-amount">
            ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
        </div>

        <div className="hero-right">
          <button 
            className="btn edit-budget-orange-btn" 
            onClick={() => onNavigateTab ? onNavigateTab('budget') : null}
          >
            Edit Budget
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="metrics-grid">
        <div className="fin-card metric-card">
          <div className="metric-icon income">
            <ArrowDownLeft size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Income</span>
            <h3 className="metric-value">₹{totalIncome.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="fin-card metric-card">
          <div className="metric-icon expense">
            <ArrowUpRight size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Expense</span>
            <h3 className="metric-value">₹{totalExpense.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="fin-card metric-card">
          <div className="metric-icon savings">
            <PiggyBank size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Savings</span>
            <h3 className="metric-value">₹{savings.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Spends Dashboard Grid */}
      <div className="dashboard-spends-grid">
        {/* Top Categories Multi-Segmented Bar Card (Screenshot Match) */}
        <CategorySpendsBar 
          categoryTotals={categoryTotals} 
          customCategories={customCategories}
          onCategoryAdded={handleCategoryAdded}
        />

        {/* Monthly Spends Trend Bar Chart */}
        <div className="fin-card chart-card">
          <div className="card-header-flex">
            <h3 className="card-title">Monthly Spends</h3>
            <div className="month-selector-badge">
              <span>{selectedMonth}</span>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="filter-chips-row">
            {categoryChips.map((chip, idx) => (
              <button
                key={idx}
                className={`filter-chip ${activeFilterChip === chip ? 'active' : ''}`}
                onClick={() => setActiveFilterChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="bar-chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyTrendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                <Bar dataKey="Spend" fill="#00E676" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
