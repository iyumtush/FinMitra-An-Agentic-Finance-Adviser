import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, Compass } from 'lucide-react';
import { aiApi } from '../api/aiApi';
import ChatBotWidget from '../components/chat/ChatBotWidget';
import './AIInsightView.css';

export default function AIInsightView() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await aiApi.getInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      setErrorMsg('Failed to generate AI financial insights. Please make sure the backend is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="ai-insight-view-container">
      <div className="view-header">
        <div>
          <h2 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="sparkle-icon" size={24} color="#00E676" />
            FinMitra AI Insights & Advisor
          </h2>
          <p className="view-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Real-time contextual analysis computed from your live database entries
          </p>
        </div>

        <button className="btn btn-primary" onClick={fetchInsights} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          {loading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      {loading ? (
        <div className="loading-state" style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
          <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--accent-green)', marginBottom: '12px' }} />
          <h3 style={{ color: 'var(--text-primary)' }}>Analyzing your financial patterns...</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Evaluating income, expenses, and category budget thresholds</p>
        </div>
      ) : errorMsg ? (
        <div className="fin-card error-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--accent-rose)' }}>
          {errorMsg}
        </div>
      ) : (
        <div className="ai-layout-grid">
          {/* Left Column: AI Cards */}
          <div className="ai-cards-column">
            {/* Monthly Summary */}
            <div className="fin-card ai-card">
              <div className="ai-card-header">
                <Compass size={20} className="icon-gold" />
                <h3>Monthly Summary</h3>
              </div>
              <p className="ai-text">{insights?.monthlySummary}</p>
              
              <div className="insight-metrics-row">
                <div className="small-stat">
                  <span>INCOME</span>
                  <strong className="text-green">₹{Number(insights?.income || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="small-stat">
                  <span>EXPENSE</span>
                  <strong className="text-rose">₹{Number(insights?.expense || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div className="small-stat">
                  <span>SAVINGS</span>
                  <strong className="text-cyan">₹{Number(insights?.savings || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Smart Savings Suggestions */}
            <div className="fin-card ai-card">
              <div className="ai-card-header">
                <Lightbulb size={20} className="icon-green" />
                <h3>Smart Savings Advice</h3>
              </div>
              <ul className="ai-tips-list">
                {insights?.savingSuggestions?.map((tip, idx) => (
                  <li key={idx}>
                    <span className="tip-bullet">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Wealth Growth Idea */}
            <div className="fin-card ai-card">
              <div className="ai-card-header">
                <TrendingUp size={20} className="icon-cyan" />
                <h3>Wealth Growth Strategy</h3>
              </div>
              <p className="ai-text">{insights?.growthIdea}</p>
            </div>
          </div>

          {/* Right Column: Mitra AI Chatbot */}
          <div className="ai-chatbot-column">
            <ChatBotWidget />
          </div>
        </div>
      )}
    </div>
  );
}
