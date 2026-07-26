import React, { useState } from 'react';
import { Filter, ChevronDown, Plus, X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import './TransactionsTable.css';

const initialTransactions = [
  { id: 1, name: 'TechCorp Salary Credit', category: 'Salary', type: 'INCOME', amount: '+$8,500.00', date: 'July 01, 2026', account: 'HDFC Bank' },
  { id: 2, name: 'D-Mart Supermarket Groceries', category: 'Groceries', type: 'EXPENSE', amount: '-$145.50', date: 'July 03, 2026', account: 'Credit Card' },
  { id: 3, name: 'State Electricity Bill', category: 'Utilities', type: 'EXPENSE', amount: '-$84.00', date: 'July 05, 2026', account: 'HDFC Bank' },
  { id: 4, name: 'Netflix Premium Subscription', category: 'Entertainment', type: 'EXPENSE', amount: '-$19.99', date: 'July 07, 2026', account: 'Credit Card' },
  { id: 5, name: 'Swiggy Gourmet Dinner', category: 'Food & Dining', type: 'EXPENSE', amount: '-$42.00', date: 'July 10, 2026', account: 'HDFC Bank' },
];

export default function TransactionsTable({ initialType = null, showAddModal = false, onCloseModal, onTransactionAdded }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showModal, setShowModal] = useState(showAddModal);
  
  const [type, setType] = useState(initialType || 'EXPENSE');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState('');

  React.useEffect(() => {
    if (showAddModal) {
      setShowModal(true);
      if (initialType) setType(initialType);
    }
  }, [showAddModal, initialType]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    const numAmount = parseFloat(amount);
    const formattedAmt = type === 'INCOME' 
      ? `+$${numAmount.toFixed(2)}` 
      : `-$${numAmount.toFixed(2)}`;

    const newTx = {
      id: Date.now(),
      name,
      category,
      type,
      amount: formattedAmt,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      account: 'HDFC Bank'
    };

    setTransactions([newTx, ...transactions]);

    if (onTransactionAdded) {
      onTransactionAdded(numAmount, type);
    }

    setName('');
    setAmount('');
    setShowModal(false);
    if (onCloseModal) onCloseModal();
  };

  return (
    <div className="fin-card transactions-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Recent Transactions</h3>
          <span className="card-subtitle">Personal income & expense ledger</span>
        </div>
        
        <div className="table-actions">
          <button className="btn-icon-pill">
            Last 30 Days <ChevronDown size={14} />
          </button>
          <button className="btn-icon-pill">
            <Filter size={14} /> Filter
          </button>
          <button className="btn btn-primary add-tx-btn" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add Transaction
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description / Name</th>
              <th>Category</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <span className={`type-icon ${tx.type.toLowerCase()}`}>
                    {tx.type === 'INCOME' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </span>
                </td>
                <td className="font-semibold text-white">{tx.name}</td>
                <td>
                  <span className="badge-category">{tx.category}</span>
                </td>
                <td className="text-muted">{tx.account}</td>
                <td className={`font-semibold ${tx.type === 'INCOME' ? 'text-green' : 'text-rose'}`}>
                  {tx.amount}
                </td>
                <td className="text-muted">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add {type === 'INCOME' ? 'Income Credit' : 'Expense Debit'}</h3>
              <button className="close-btn" onClick={() => { setShowModal(false); if (onCloseModal) onCloseModal(); }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="modal-form">
              <div className="type-switcher">
                <button 
                  type="button" 
                  className={`type-btn ${type === 'EXPENSE' ? 'active-expense' : ''}`}
                  onClick={() => setType('EXPENSE')}
                >
                  Expense
                </button>
                <button 
                  type="button" 
                  className={`type-btn ${type === 'INCOME' ? 'active-income' : ''}`}
                  onClick={() => setType('INCOME')}
                >
                  Income
                </button>
              </div>

              <div className="input-group">
                <label>Description / Recipient</label>
                <input 
                  type="text" 
                  placeholder="e.g. Electricity Bill or Salary" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Salary">Salary & Income</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Utilities">Utilities & Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping & Fashion</option>
                  <option value="Investments">Investments</option>
                </select>
              </div>

              <div className="input-group">
                <label>Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="100.00" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary full-btn">Save Entry</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
