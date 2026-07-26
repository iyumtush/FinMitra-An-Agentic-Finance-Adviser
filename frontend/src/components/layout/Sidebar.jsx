import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Sparkles, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'transactions', icon: Receipt, label: 'Transactions' },
    { id: 'budget', icon: PieChart, label: 'Budget' },
    { id: 'insights', icon: Sparkles, label: 'AI Insight' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        {/* Brand Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 18L10 6L14 13L20 4" stroke="#00E676" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="logo-text">finMitra</span>
        </div>

        {/* Main Nav Links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {item.id === 'insights' && <span className="sparkle-badge">AI</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Link at Bottom */}
      <div className="sidebar-bottom">
        <button className="nav-link logout-link" onClick={logout}>
          <LogOut size={18} className="nav-icon" />
          <span className="nav-label">Log out</span>
        </button>
      </div>
    </aside>
  );
}
