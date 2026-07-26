import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import './PortfolioChart.css';

const cashFlowData = [
  { month: 'Jan', income: 7800, expense: 3100, savings: 4700 },
  { month: 'Feb', income: 8000, expense: 3400, savings: 4600 },
  { month: 'Mar', income: 8200, expense: 2900, savings: 5300 },
  { month: 'Apr', income: 8500, expense: 3600, savings: 4900 },
  { month: 'May', income: 8500, expense: 3100, savings: 5400 },
  { month: 'Jun', income: 8500, expense: 3240, savings: 5260 },
];

export default function PortfolioChart() {
  const [timeframe, setTimeframe] = useState('Month');

  return (
    <div className="fin-card portfolio-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Income & Expense Cash Flow</h3>
          <span className="card-subtitle">Monthly cash flow trends for 2026</span>
        </div>
        
        <div className="timeframe-selector">
          {['Day', 'Week', 'Month', 'Year'].map((tf) => (
            <button
              key={tf}
              className={`time-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
          <button className="expand-btn" title="Expand">
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={cashFlowData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(v) => `$${v / 1000}k`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar 
              dataKey="income" 
              name="Income" 
              fill="#00E676" 
              radius={[6, 6, 0, 0]} 
              barSize={14}
            />
            <Bar 
              dataKey="expense" 
              name="Expense" 
              fill="#F43F5E" 
              radius={[6, 6, 0, 0]} 
              barSize={14}
            />
            <Line 
              type="monotone" 
              dataKey="savings" 
              name="Net Savings" 
              stroke="#06B6D4" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#06B6D4' }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const inc = payload.find(p => p.dataKey === 'income')?.value;
    const exp = payload.find(p => p.dataKey === 'expense')?.value;
    const sav = payload.find(p => p.dataKey === 'savings')?.value;

    return (
      <div className="custom-chart-tooltip">
        <span className="tooltip-month">{label} Cash Flow</span>
        <div className="tooltip-row green">Income: <span>${inc?.toLocaleString()}</span></div>
        <div className="tooltip-row red">Expense: <span>${exp?.toLocaleString()}</span></div>
        <div className="tooltip-row cyan">Net Savings: <span>${sav?.toLocaleString()}</span></div>
      </div>
    );
  }
  return null;
}
