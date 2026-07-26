import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { login, signup, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!isLogin && !name.trim()) {
      setLocalError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (isLogin) {
      const res = await login(email, password);
      if (!res.success) setLocalError(res.error);
    } else {
      const res = await signup(name, email, password);
      if (!res.success) setLocalError(res.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background-glow"></div>
      
      <div className="auth-card">
        {/* Vector Illustration Header */}
        <div className="auth-illustration">
          <div className="illustration-badge">
            <ShieldCheck size={20} color="#00E676" />
            <span>Bank-Grade Security</span>
          </div>
          <svg className="auth-svg" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="70" r="50" fill="url(#circleGlow)" opacity="0.15" />
            <rect x="50" y="30" width="100" height="70" rx="14" fill="#161C26" stroke="#00E676" strokeWidth="2" />
            <rect x="65" y="45" width="35" height="20" rx="4" fill="#00E676" opacity="0.8" />
            <circle cx="130" cy="55" r="8" fill="#3B82F6" />
            <circle cx="142" cy="55" r="8" fill="#F59E0B" opacity="0.8" />
            <line x1="65" y1="80" x2="135" y2="80" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <defs>
              <radialGradient id="circleGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 70) scale(50)">
                <stop stopColor="#00E676" />
                <stop offset="1" stopColor="#00E676" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <div className="auth-header">
          <h2>{isLogin ? 'Sign In to finMitra' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter valid email & password to continue' : 'Use proper information to continue'}</p>
        </div>

        {/* Toggle Switch */}
        <div className="auth-toggle-bar">
          <button 
            type="button" 
            className={`toggle-btn ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setLocalError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setLocalError(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {(localError || error) && (
          <div className="auth-error-alert">
            {localError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-field">
                <User size={18} className="field-icon" />
                <input 
                  type="text" 
                  placeholder="e.g. Tushar Sharma" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-field">
              <Mail size={18} className="field-icon" />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-field">
              <Lock size={18} className="field-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="At least 6 characters" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="forgot-password">
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link has been sent to your email.'); }}>Forgot password?</a>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                {isLogin ? 'Login to Dashboard' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          {isLogin ? (
            <p>Haven't any account? <span onClick={() => setIsLogin(false)}>Sign up</span></p>
          ) : (
            <p>Already have an Account? <span onClick={() => setIsLogin(true)}>Sign in</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
