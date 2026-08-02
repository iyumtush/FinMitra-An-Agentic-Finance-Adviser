import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownLeft, PiggyBank, RefreshCw, ChevronDown, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { transactionApi } from '../api/transactionApi';
import { categoryApi } from '../api/categoryApi';
import CategorySpendsBar from '../components/dashboard/CategorySpendsBar';
import './DashboardView.css';

const MONTHS_LIST = [
  'Current Month',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'All Months'
];

const MONTH_INDEX_MAP = {
  'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
  'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
};

export default function DashboardView({ onNavigateTab }) {
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('Current Month');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [activeFilterChip, setActiveFilterChip] = useState('All');
  const [viewMode, setViewMode] = useState('weeks'); // 'days' or 'weeks'

  const monthDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setIsMonthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txData, catData] = await Promise.all([
        transactionApi.getTransactions(),
        categoryApi.getCategories().catch(() => [])
      ]);
      setTransactions(txData);
      setCustomCategories(catData || []);
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

  // Filter transactions based on selected month
  const filteredTransactions = transactions.filter(t => {
    if (selectedMonth === 'All Months') return true;
    if (!t.date) return true;

    const d = new Date(t.date);
    if (isNaN(d.getTime())) return true;

    if (selectedMonth === 'Current Month') {
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }

    const targetMonthIndex = MONTH_INDEX_MAP[selectedMonth];
    if (targetMonthIndex !== undefined) {
      return d.getMonth() === targetMonthIndex;
    }

    return true;
  });

  // Compute Overall Income & Expense Metrics for selected month
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  filteredTransactions.forEach(t => {
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

  // Filter Expense Transactions matching selected Filter Chip
  const expenseTx = filteredTransactions.filter(t => {
    const isExpense = (t.type || '').toUpperCase() === 'EXPENSE';
    if (!isExpense) return false;
    if (activeFilterChip === 'All') return true;
    return (t.category || '').toLowerCase() === activeFilterChip.toLowerCase();
  });

  // Calculate Real Trend Data based on View Mode ('days' vs 'weeks')
  let realTrendData = [];

  if (viewMode === 'days') {
    // DAYS OF WEEK MODE: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const daysMap = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    expenseTx.forEach(t => {
      if (!t.date) return;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;
      const dayName = dayNames[d.getDay()];
      if (daysMap[dayName] !== undefined) {
        daysMap[dayName] += Number(t.amount || 0);
      }
    });

    realTrendData = [
      { name: 'Mon', Spend: daysMap['Mon'] },
      { name: 'Tue', Spend: daysMap['Tue'] },
      { name: 'Wed', Spend: daysMap['Wed'] },
      { name: 'Thu', Spend: daysMap['Thu'] },
      { name: 'Fri', Spend: daysMap['Fri'] },
      { name: 'Sat', Spend: daysMap['Sat'] },
      { name: 'Sun', Spend: daysMap['Sun'] },
    ];
  } else {
    // WEEKS OF MONTH MODE: Week 1, Week 2, Week 3, Week 4, Week 5
    const weeksMap = {
      'Week 1': 0,
      'Week 2': 0,
      'Week 3': 0,
      'Week 4': 0,
      'Week 5': 0
    };

    expenseTx.forEach(t => {
      if (!t.date) return;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;
      const dayOfMonth = d.getDate();

      if (dayOfMonth >= 1 && dayOfMonth <= 7) weeksMap['Week 1'] += Number(t.amount || 0);
      else if (dayOfMonth >= 8 && dayOfMonth <= 14) weeksMap['Week 2'] += Number(t.amount || 0);
      else if (dayOfMonth >= 15 && dayOfMonth <= 21) weeksMap['Week 3'] += Number(t.amount || 0);
      else if (dayOfMonth >= 22 && dayOfMonth <= 28) weeksMap['Week 4'] += Number(t.amount || 0);
      else if (dayOfMonth >= 29) weeksMap['Week 5'] += Number(t.amount || 0);
    });

    realTrendData = [
      { name: 'Week 1', Spend: weeksMap['Week 1'] },
      { name: 'Week 2', Spend: weeksMap['Week 2'] },
      { name: 'Week 3', Spend: weeksMap['Week 3'] },
      { name: 'Week 4', Spend: weeksMap['Week 4'] },
    ];

    if (weeksMap['Week 5'] > 0) {
      realTrendData.push({ name: 'Week 5', Spend: weeksMap['Week 5'] });
    }
  }

  // Check if all periods have 0 spend for current filter
  const hasSpendData = realTrendData.some(item => item.Spend > 0);
  const categoryChips = ['All', ...Object.keys(categoryTotals)];

  return (
    <div className="dashboard-view-container">
      {/* Top Header Bar matching Screenshot */}
      <div className="spends-hero-banner">
        <div className="hero-left">
          <span className="hero-sub">
            {selectedMonth === 'Current Month' ? 'Spends this month' : selectedMonth === 'All Months' ? 'Spends across all months' : `Spends in ${selectedMonth}`}
          </span>
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
        {/* Top Categories Multi-Segmented Bar Card */}
        <CategorySpendsBar 
          categoryTotals={categoryTotals} 
          customCategories={customCategories}
          onCategoryAdded={handleCategoryAdded}
        />

        {/* Monthly Spends Trend Bar Chart */}
        <div className="fin-card chart-card">
          <div className="card-header-flex" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <h3 className="card-title">Monthly Spends</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Days vs Weeks View Mode Toggle */}
              <div className="view-mode-pills">
                <button 
                  className={`view-mode-pill ${viewMode === 'days' ? 'active' : ''}`}
                  onClick={() => setViewMode('days')}
                  title="View by Days of Week"
                >
                  Days
                </button>
                <button 
                  className={`view-mode-pill ${viewMode === 'weeks' ? 'active' : ''}`}
                  onClick={() => setViewMode('weeks')}
                  title="View by Weeks of Month"
                >
                  Weeks
                </button>
              </div>

              {/* Month Selector Dropdown */}
              <div className="month-selector-wrapper" ref={monthDropdownRef}>
                <button 
                  type="button"
                  className={`month-selector-badge ${isMonthDropdownOpen ? 'active' : ''}`}
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                  aria-label="Select month"
                >
                  <span>{selectedMonth}</span>
                  <ChevronDown 
                    size={14} 
                    style={{ 
                      transform: isMonthDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                </button>

                {isMonthDropdownOpen && (
                  <div className="month-dropdown-menu">
                    <div className="month-dropdown-header">Select Month</div>
                    <div className="month-dropdown-list">
                      {MONTHS_LIST.map((month) => (
                        <button
                          key={month}
                          type="button"
                          className={`month-dropdown-item ${selectedMonth === month ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedMonth(month);
                            setIsMonthDropdownOpen(false);
                          }}
                        >
                          <span>{month}</span>
                          {selectedMonth === month && <span className="checkmark">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
            {loading ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={24} className="spin-icon" />
              </div>
            ) : !hasSpendData ? (
              <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '8px', fontSize: '0.88rem' }}>
                <Calendar size={28} />
                <span>No expense transactions logged for {selectedMonth === 'Current Month' ? 'this month' : selectedMonth} yet.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={realTrendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Bar dataKey="Spend" fill="#00E676" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

