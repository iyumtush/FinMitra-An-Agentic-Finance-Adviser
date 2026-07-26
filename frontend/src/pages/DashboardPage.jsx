import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import DashboardView from '../views/DashboardView';
import TransactionsView from '../views/TransactionsView';
import BudgetView from '../views/BudgetView';
import AIInsightView from '../views/AIInsightView';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [income, setIncome] = useState(35000);
  const [expense, setExpense] = useState(23500);

  const handleTransactionChange = (newTxList) => {
    let inc = 0;
    let exp = 0;
    newTxList.forEach(t => {
      if (t.type === 'Income') inc += t.amount;
      else exp += t.amount;
    });
    setIncome(inc);
    setExpense(exp);
  };

  return (
    <div className="app-container">
      {/* Left Vertical Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main App Content */}
      <div className="main-content">
        <TopHeader />

        <main className="content-grid">
          {activeTab === 'dashboard' && (
            <DashboardView income={income} expense={expense} />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView onTransactionChange={handleTransactionChange} />
          )}

          {activeTab === 'budget' && (
            <BudgetView />
          )}

          {activeTab === 'insights' && (
            <AIInsightView />
          )}
        </main>
      </div>
    </div>
  );
}
