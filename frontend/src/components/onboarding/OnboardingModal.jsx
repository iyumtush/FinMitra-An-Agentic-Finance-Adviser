import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, DollarSign, PieChart, Layers } from 'lucide-react';
import { transactionApi } from '../../api/transactionApi';
import { budgetApi } from '../../api/budgetApi';
import './OnboardingModal.css';

export default function OnboardingModal({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [income, setIncome] = useState('50000');
  const [expenseCategory, setExpenseCategory] = useState('Rent');
  const [expenseAmount, setExpenseAmount] = useState('15000');
  const [budgetCategory, setBudgetCategory] = useState('Food');
  const [budgetLimit, setBudgetLimit] = useState('8000');

  const handleNext = () => {
    if (step === 1 && (!income || parseFloat(income) <= 0)) return;
    if (step === 2 && (!expenseAmount || parseFloat(expenseAmount) <= 0)) return;
    setStep(prev => prev + 1);
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!budgetLimit || parseFloat(budgetLimit) <= 0) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      // 1. Log initial Salary Income Transaction
      if (parseFloat(income) > 0) {
        await transactionApi.createTransaction({
          amount: parseFloat(income),
          category: 'Salary',
          note: 'Monthly salary / income setup',
          type: 'INCOME',
          date: today
        });
      }

      // 2. Log initial Expense Transaction
      if (parseFloat(expenseAmount) > 0) {
        await transactionApi.createTransaction({
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
          note: `Initial ${expenseCategory} expense`,
          type: 'EXPENSE',
          date: today
        });
      }

      // 3. Set initial Category Budget Limit
      if (parseFloat(budgetLimit) > 0) {
        await budgetApi.setBudget({
          category: budgetCategory,
          limitAmount: parseFloat(budgetLimit)
        });
      }

      // Mark user as onboarded in localStorage
      localStorage.setItem(`finmitra_onboarded_${user?.email || 'user'}`, 'true');

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Onboarding Setup Error:', err);
      // Fallback mark onboarded so modal closes gracefully
      localStorage.setItem(`finmitra_onboarded_${user?.email || 'user'}`, 'true');
      if (onComplete) onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-card">
        {/* Header Badge */}
        <div className="onboarding-header">
          <div className="onboarding-badge">
            <Sparkles size={16} color="var(--accent-green)" />
            <span>Welcome to finMitra</span>
          </div>
          <h2 className="onboarding-title">Let's set up your finances</h2>
          <p className="onboarding-sub">Answer 3 quick questions to customize your dashboard metrics.</p>
        </div>

        {/* Step Indicator Pills */}
        <div className="steps-indicator">
          <div className={`step-pill ${step >= 1 ? 'active' : ''}`}>1. Income</div>
          <div className={`step-pill ${step >= 2 ? 'active' : ''}`}>2. Expenses</div>
          <div className={`step-pill ${step >= 3 ? 'active' : ''}`}>3. Budget Goal</div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinish} className="onboarding-form">
          {step === 1 && (
            <div className="step-content">
              <div className="step-icon-badge">
                <DollarSign size={24} color="var(--accent-green)" />
              </div>
              <h3>What is your estimated monthly income?</h3>
              <p className="step-desc">Enter your expected monthly salary or total incoming revenue.</p>
              
              <div className="input-group">
                <label>Monthly Income (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 50000" 
                  value={income} 
                  onChange={(e) => setIncome(e.target.value)} 
                  required 
                  autoFocus
                />
              </div>

              <button type="button" className="btn btn-primary full-btn" onClick={handleNext}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="step-icon-badge">
                <Layers size={24} color="var(--accent-cyan)" />
              </div>
              <h3>What is your biggest monthly expense?</h3>
              <p className="step-desc">Specify your major recurring monthly payment (e.g. Rent, Groceries, EMI).</p>

              <div className="input-group">
                <label>Category</label>
                <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
                  <option value="Rent">Rent</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div className="input-group">
                <label>Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 15000" 
                  value={expenseAmount} 
                  onChange={(e) => setExpenseAmount(e.target.value)} 
                  required 
                  autoFocus
                />
              </div>

              <button type="button" className="btn btn-primary full-btn" onClick={handleNext}>
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <div className="step-icon-badge">
                <PieChart size={24} color="var(--accent-amber)" />
              </div>
              <h3>Set your initial category budget limit</h3>
              <p className="step-desc">Pick a category you want to keep under control this month.</p>

              <div className="input-group">
                <label>Budget Category</label>
                <select value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)}>
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>

              <div className="input-group">
                <label>Monthly Limit (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 8000" 
                  value={budgetLimit} 
                  onChange={(e) => setBudgetLimit(e.target.value)} 
                  required 
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary full-btn" disabled={loading}>
                {loading ? 'Initializing Your Dashboard...' : 'Complete Setup & Build Dashboard ✨'}
              </button>
            </div>
          )}
        </form>

        <div className="onboarding-footer">
          <ShieldCheck size={14} />
          <span>Your information is encrypted & saved securely in MySQL.</span>
        </div>
      </div>
    </div>
  );
}
