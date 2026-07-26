import React from 'react';
import { Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './TopHeader.css';

export default function TopHeader() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const userName = user?.name || 'Tushar';

  return (
    <header className="top-header">
      <div className="user-welcome">
        <span className="welcome-sub">Welcome back,</span>
        <h1 className="welcome-title">{userName}</h1>
      </div>

      <div className="header-right">
        {/* Day / Dark Mode Theme Toggle */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Day' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} className="theme-icon sun" />
              <span>Day Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} className="theme-icon moon" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <button className="icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="bell-dot"></span>
        </button>

        {/* User Profile */}
        <div className="header-user-avatar">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
            alt={userName}
          />
        </div>
      </div>
    </header>
  );
}
