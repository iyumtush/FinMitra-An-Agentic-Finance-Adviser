import React from 'react';
import { ArrowUpRight, ArrowDownLeft, PiggyBank } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './DashboardView.css';

export default function DashboardView({ income = 35000, expense = 23500 }) {
  const savings = income - expense;

  const categoryData = [
    { name: 'Rent', value: 10000, color: '#A16207' },
    { name: 'Food', value: 6200, color: '#059669' },
    { name: 'Transport', value: 1800, color: '#0284C7' },
    { name: 'Shopping', value: 3400, color: '#C2410C' },
  ];

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
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
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
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="fin-card chart-card">
          <h3 className="card-title">Income vs expense</h3>
          <div className="bar-chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={compareData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="Income" fill="#059669" radius={[8, 8, 0, 0]} barSize={50} />
                <Bar dataKey="Expense" fill="#C2410C" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
