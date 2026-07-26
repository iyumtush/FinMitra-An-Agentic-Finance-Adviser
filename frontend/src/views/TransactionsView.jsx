import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import './TransactionsView.css';

const initialTxList = [
  { id: 1, date: '2026-07-01', category: 'Salary', note: 'Monthly salary', type: 'Income', amount: 35000 },
  { id: 2, date: '2026-07-02', category: 'Rent', note: 'House rent', type: 'Expense', amount: 10000 },
  { id: 3, date: '2026-07-10', category: 'Food', note: 'Groceries + eating out', type: 'Expense', amount: 6200 },
  { id: 4, date: '2026-07-12', category: 'Transport', note: 'Bus pass + auto', type: 'Expense', amount: 1800 },
  { id: 5, date: '2026-07-18', category: 'Shopping', note: 'Clothes', type: 'Expense', amount: 3400 },
  { id: 6, date: '2026-07-22', category: 'Food', note: 'Dining out', type: 'Expense', amount: 2100 },
];

export default function TransactionsView({ onTransactionChange }) {
  const [txList, setTxList] = useState(initialTxList);
  const [showModal, setShowModal] = useState(false);
  
  const [date, setDate] = useState('2026-07-26');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [type, setType] = useState('Expense');
  const [amount, setAmount] = useState('');

  const handleDelete = (id) => {
    const updated = txList.filter(t => t.id !== id);
    setTxList(updated);
    if (onTransactionChange) onTransactionChange(updated);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!amount || !note) return;

    const newTx = {
      id: Date.now(),
      date,
      category,
      note,
      type,
      amount: parseFloat(amount)
    };

    const updated = [newTx, ...txList];
    setTxList(updated);
    if (onTransactionChange) onTransactionChange(updated);

    setNote('');
    setAmount('');
    setShowModal(false);
  };

  return (
    <div className="transactions-view-container">
      <div className="view-header">
        <h2 className="view-title">All transactions</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add transaction
        </button>
      </div>

      <div className="fin-card table-card">
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>CATEGORY</th>
                <th>NOTE</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {txList.map((tx) => (
                <tr key={tx.id}>
                  <td className="text-muted">{tx.date}</td>
                  <td>
                    <span className={`badge-category ${tx.category.toLowerCase()}`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="font-semibold">{tx.note}</td>
                  <td className="text-muted">{tx.type}</td>
                  <td className={`font-semibold ${tx.type === 'Income' ? 'text-green' : 'text-rose'}`}>
                    {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(tx.id)} 
                      title="Delete Transaction"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add New Transaction</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="modal-form">
              <div className="type-toggle">
                <button 
                  type="button" 
                  className={`type-btn ${type === 'Expense' ? 'active-expense' : ''}`}
                  onClick={() => setType('Expense')}
                >
                  Expense
                </button>
                <button 
                  type="button" 
                  className={`type-btn ${type === 'Income' ? 'active-income' : ''}`}
                  onClick={() => setType('Income')}
                >
                  Income
                </button>
              </div>

              <div className="input-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Salary">Salary</option>
                  <option value="Rent">Rent</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                </select>
              </div>

              <div className="input-group">
                <label>Note / Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Monthly salary or Groceries" 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 5000" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary full-btn">Save Transaction</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
