import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, PiggyBank, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { transactionApi } from '../api/transactionApi';
import './DashboardView.css';

const CATEGORY_COLORS = {
  Rent: '#A16207',
  Food: '#059669',
  Transport: '#0284C7',
  Shopping: '#C2410C',
  Entertainment: '#7C3AED',
  Salary: '#10B981',
  Other: '#64748B'
};

export default function DashboardView({ income: propIncome, expense: propExpense }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionApi.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Compute Metrics Dynamically from Real User Transactions
  let calculatedIncome = 0;
  let calculatedExpense = 0;
  const categoryTotals = {};

  transactions.forEach(t => {
    const amt = Number(t.amount || 0);
    const typeUpper = t.type ? t.type.toUpperCase() : 'EXPENSE';
    const cat = t.category || 'Other';

    if (typeUpper === 'INCOME') {
      calculatedIncome += amt;
    } else {
      calculatedExpense += amt;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    }
  });

  const income = transactions.length > 0 ? calculatedIncome : (propIncome || 0);
  const expense = transactions.length > 0 ? calculatedExpense : (propExpense || 0);
  const savings = income - expense;

  // Donut Chart Data
  const categoryData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat],
    color: CATEGORY_COLORS[cat] || '#059669'
  }));

  const compareData = [
    { name: 'This month', Income: income, Expense: expense }
  ];

  return (
    <div className="dashboard-view-container">
      {/* Top 3 Metric Cards */}
      <div className="metrics-grid">
        <div className="fin-card metric-card">
          <div className="metric-icon income">
            <ArrowDownLeft size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Income</span>
            <h3 className="metric-value">₹{income.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="fin-card metric-card">
          <div className="metric-icon expense">
            <ArrowUpRight size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Expense</span>
            <h3 className="metric-value">₹{expense.toLocaleString('en-IN')}</h3>
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

      {/* 2 Main Charts */}
      <div className="charts-grid">
        {/* Spending by category Donut Chart */}
        <div className="fin-card chart-card">
          <h3 className="card-title">Spending by category</h3>
          {loading ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={24} className="spin-icon" />
            </div>
          ) : categoryData.length === 0 ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No expenses recorded yet.
            </div>
          ) : (
            <div className="donut-chart-container">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>

              <div className="chart-legend">
                {categoryData.map((cat, idx) => (
                  <div key={idx} className="legend-chip">
                    <span className="chip-dot" style={{ backgroundColor: cat.color }}></span>
                    <span className="chip-label">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="fin-card chart-card">
          <h3 className="card-title">Income vs expense</h3>
          {loading ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={24} className="spin-icon" />
            </div>
          ) : (
            <div className="bar-chart-container">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={compareData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Legend />
                  <Bar dataKey="Income" fill="#059669" radius={[8, 8, 0, 0]} barSize={50} />
                  <Bar dataKey="Expense" fill="#C2410C" radius={[8, 8, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
