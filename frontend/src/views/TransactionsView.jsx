import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionApi } from '../api/transactionApi';
import { categoryApi } from '../api/categoryApi';
import './TransactionsView.css';

export default function TransactionsView({ onTransactionChange }) {
  const { user } = useAuth();
  const [txList, setTxList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [type, setType] = useState('Expense');
  const [amount, setAmount] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txData, catData] = await Promise.all([
        transactionApi.getTransactions(),
        categoryApi.getCategories()
      ]);
      setTxList(txData);
      setCategories(catData);
      if (onTransactionChange) onTransactionChange(txData);
    } catch (err) {
      console.error('Failed to fetch transactions or categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingTx(null);
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Food');
    setNote('');
    setType('Expense');
    setAmount('');
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setDate(tx.date);
    setCategory(tx.category);
    setNote(tx.note);
    setType(tx.type === 'INCOME' || tx.type === 'Income' ? 'Income' : 'Expense');
    setAmount(tx.amount.toString());
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactionApi.deleteTransaction(id);
      const updated = txList.filter(t => t.id !== id);
      setTxList(updated);
      if (onTransactionChange) onTransactionChange(updated);
    } catch (err) {
      alert('Failed to delete transaction');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !note) return;
    setErrorMsg('');

    try {
      const payload = {
        amount: parseFloat(amount),
        category,
        note,
        type: type.toUpperCase(),
        date
      };

      if (editingTx) {
        const updatedTx = await transactionApi.updateTransaction(editingTx.id, payload);
        const updatedList = txList.map(t => t.id === editingTx.id ? updatedTx : t);
        setTxList(updatedList);
        if (onTransactionChange) onTransactionChange(updatedList);
      } else {
        const newTx = await transactionApi.createTransaction(payload);
        const updatedList = [newTx, ...txList];
        setTxList(updatedList);
        if (onTransactionChange) onTransactionChange(updatedList);
      }

      setNote('');
      setAmount('');
      setShowModal(false);
      setEditingTx(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  // Combine default categories with custom user categories
  const defaultCats = ['To People', 'Health', 'Food, Beverages and Groceries', 'Travel & Transport', 'Online Shopping', 'Salary', 'Rent', 'Food', 'Transport', 'Shopping', 'Entertainment'];
  const customCatNames = categories.map(c => c.name);
  const allCategoryOptions = Array.from(new Set([...defaultCats, ...customCatNames]));

  return (
    <div className="transactions-view-container">
      <div className="view-header">
        <h2 className="view-title">All transactions</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          Add transaction
        </button>
      </div>

      <div className="fin-card table-card">
        {loading ? (
          <div className="loading-state" style={{ padding: '30px', textAlign: 'center' }}>
            <RefreshCw size={24} className="spin-icon" /> Loading your live transactions...
          </div>
        ) : txList.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No transactions found. Click "+ Add transaction" to log your first entry!
          </div>
        ) : (
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
                      <span className={`badge-category ${tx.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="font-semibold">{tx.note}</td>
                    <td className="text-muted">{tx.type}</td>
                    <td className={`font-semibold ${tx.type === 'INCOME' || tx.type === 'Income' ? 'text-green' : 'text-rose'}`}>
                      {tx.type === 'INCOME' || tx.type === 'Income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="actions-cell" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => openEditModal(tx)} 
                          title="Edit Transaction"
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: '4px' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDelete(tx.id)} 
                          title="Delete Transaction"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingTx ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {errorMsg && <div className="error-badge">{errorMsg}</div>}

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
                  {allCategoryOptions.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
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
                  step="0.01"
                  placeholder="e.g. 5000" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary full-btn">
                {editingTx ? 'Update Transaction' : 'Save to MySQL'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
