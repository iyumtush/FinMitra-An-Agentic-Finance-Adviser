import React from 'react';
import { Building2, CreditCard, TrendingUp, ShieldCheck, ArrowUpRight } from 'lucide-react';
import './TopAssetsGrid.css';

const accounts = [
  {
    id: 'hdfc',
    name: 'HDFC Bank Account',
    type: 'Primary Savings',
    balance: '$18,450.00',
    change: 'Active',
    changeType: 'positive',
    iconBg: '#0A2540',
    icon: Building2,
  },
  {
    id: 'cc',
    name: 'ICICI Credit Card',
    type: 'Limit $5,000',
    balance: '-$1,280.00',
    change: 'Used 25%',
    changeType: 'neutral',
    iconBg: '#991B1B',
    icon: CreditCard,
  },
  {
    id: 'inv',
    name: 'Zerodha Mutual Fund',
    type: 'Equity & Stocks',
    balance: '$21,600.00',
    change: '+12.4% Return',
    changeType: 'positive',
    iconBg: '#065F46',
    icon: TrendingUp,
  },
  {
    id: 'emerg',
    name: 'Emergency Savings',
    type: 'Goal $10,000',
    balance: '$4,080.00',
    change: '40.8% Complete',
    changeType: 'positive',
    iconBg: '#3730A3',
    icon: ShieldCheck,
  }
];

export default function TopAssetsGrid() {
  return (
    <div className="top-assets-wrapper">
      <div className="assets-header">
        <h3 className="card-title">My Financial Accounts</h3>
        <button className="view-more-btn">+ Connect Bank</button>
      </div>

      <div className="assets-grid">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          return (
            <div key={acc.id} className="fin-card asset-card">
              <div className="asset-card-top">
                <div className="asset-info">
                  <div className="asset-icon" style={{ backgroundColor: acc.iconBg, color: '#FFF' }}>
                    <Icon size={18} />
                  </div>
                  <div className="asset-names">
                    <span className="asset-name">{acc.name}</span>
                    <span className="asset-sub">{acc.type}</span>
                  </div>
                </div>
                <button className="asset-link-btn" title="Account Details">
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="asset-card-bottom">
                <span className="asset-price">{acc.balance}</span>
                <span className={`badge-pill ${acc.changeType}`}>
                  {acc.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
