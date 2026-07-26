import React, { useState } from 'react';
import { Sparkles, Lightbulb, TrendingUp, Compass, RefreshCw } from 'lucide-react';
import './AIInsightView.css';

export default function AIInsightView() {
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasGenerated(true);
    }, 800);
  };

  return (
    <div className="ai-insight-view-container">
      {/* Sparkle Header Card */}
      <div className="fin-card ai-trigger-card">
        <div className="sparkle-icon-circle">
          <Sparkles size={24} color="var(--accent-green)" />
        </div>
        <h3 className="ai-card-title">Get your monthly insight</h3>
        <p className="ai-card-sub">A quick summary of your spending, with saving and growth suggestions.</p>
        
        <button className="btn btn-primary generate-btn" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw size={16} className="spin-icon" /> Analyzing your finances...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Get my financial insight
            </>
          )}
        </button>
      </div>

      {/* Generated Insights */}
      {hasGenerated && (
        <div className="insights-results-list">
          {/* Monthly Summary */}
          <div className="fin-card insight-card">
            <div className="insight-card-header">
              <Compass size={18} className="insight-icon cyan" />
              <h4 className="insight-title">Monthly summary</h4>
            </div>
            <p className="insight-body">
              You earned <strong>₹35,000</strong> and spent <strong>₹23,500</strong> this month, saving <strong>₹11,500</strong>. Your biggest expense category was <strong>Rent at ₹10,000</strong>.
            </p>
          </div>

          {/* Saving Suggestions */}
          <div className="fin-card insight-card">
            <div className="insight-card-header">
              <Lightbulb size={18} className="insight-icon amber" />
              <h4 className="insight-title">Saving suggestions</h4>
            </div>
            <ul className="suggestions-list">
              <li>
                <strong>Rent is your highest spend category</strong> — even a 15% cut here would free up meaningful money each month.
              </li>
              <li>
                Try setting a fixed weekly cap for discretionary spends like shopping and dining out, rather than tracking it only at month-end.
              </li>
            </ul>
          </div>

          {/* Growth Idea */}
          <div className="fin-card insight-card">
            <div className="insight-card-header">
              <TrendingUp size={18} className="insight-icon green" />
              <h4 className="insight-title">Growth idea</h4>
            </div>
            <p className="insight-body">
              Once your monthly savings are consistent, it's worth learning about recurring deposits or index fund SIPs as a starting point — this is general education, not personalized investment advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
