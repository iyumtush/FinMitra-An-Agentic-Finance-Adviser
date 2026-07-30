import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { transactionApi } from '../api/transactionApi';
import { categoryApi } from '../api/categoryApi';
import './TransactionsView.css';

const BUILT_IN_CATEGORIES = [
  'To People',
  'Health',
  'Food, Beverages and Groceries',
  'Travel & Transport',
  'Online Shopping',
  'Rent',
  'Utilities',
  'Entertainment',
  'Salary'
];

export default function TransactionsView({ onTransactionChange }) {
  const { user } = useAuth();
  const [txList, setTxList] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState('Food, Beverages and Groceries');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState('#00E676');
  const [note, setNote] = useState('');
  const [type, setType] = useState('Expense');
  const [amount, setAmount] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txData, catData] = await Promise.all([
        transactionApi.getTransactions(),
        categoryApi.getCategories().catch(() => [])
      ]);
      setTxList(txData);
      setCustomCategories(catData || []);
      if (onTransactionChange) onTransactionChange(txData);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
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
    setSelectedCategoryOption('Food, Beverages and Groceries');
    setCustomCategoryInput('');
    setCustomCategoryColor('#00E676');
    setNote('');
    setType('Expense');
    setAmount('');
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setDate(tx.date);
    setSelectedCategoryOption(tx.category);
    setCustomCategoryInput('');
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

    let finalCategory = selectedCategoryOption;

    try {
      if (selectedCategoryOption === '__CUSTOM__') {
        if (!customCategoryInput.trim()) {
          setErrorMsg('Please enter a custom category name');
          return;
        }

        try {
          const newCat = await categoryApi.createCategory({
            name: customCategoryInput.trim(),
            color: customCategoryColor
          });
          finalCategory = newCat.name;
          setCustomCategories([...customCategories, newCat]);
        } catch (catErr) {
          finalCategory = customCategoryInput.trim();
        }
      }

      const payload = {
        amount: parseFloat(amount),
        category: finalCategory,
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

      setShowModal(false);
      setEditingTx(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const customNames = customCategories.map(c => c.name);
  const allCategoryOptions = Array.from(new Set([...BUILT_IN_CATEGORIES, ...customNames]));

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
            <RefreshCw size={24} className="spin-icon" /> Loading live transactions...
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
              {errorMsg && <div className="error-badge" style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', padding: '10px', borderRadius: '10px', fontSize: '0.85rem' }}>{errorMsg}</div>}

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
                <select 
                  value={selectedCategoryOption} 
                  onChange={(e) => setSelectedCategoryOption(e.target.value)}
                >
                  {allCategoryOptions.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                  <option value="__CUSTOM__">✨ + Add Custom Category...</option>
                </select>
              </div>

              {selectedCategoryOption === '__CUSTOM__' && (
                <div style={{ background: 'var(--badge-bg)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="input-group">
                    <label>New Custom Category Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pets, Gaming, Crypto" 
                      value={customCategoryInput} 
                      onChange={(e) => setCustomCategoryInput(e.target.value)} 
                      required 
                      autoFocus
                    />
                  </div>

                  <div className="input-group">
                    <label>Category Theme Color</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="color" 
                        value={customCategoryColor} 
                        onChange={(e) => setCustomCategoryColor(e.target.value)} 
                        style={{ width: '44px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{customCategoryColor}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Note / Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sent to Ramesh or Monthly Groceries" 
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
                {editingTx ? 'Update' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
