import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './AuthModal.css';

function AuthModal({ onLogin, onSignup, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all fields.");
      return;
    }

    if (isLogin) {
      const success = onLogin(email, password);
      if (!success) setError("Invalid email or password.");
    } else {
      const success = onSignup(name, email, password);
      if (!success) setError("Account with this email already exists.");
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'transparent', width: '0%' };
    if (pass.length < 4) return { label: 'Weak', color: '#ff4d4f', width: '33%' };
    if (pass.length < 8) return { label: 'Medium', color: '#ffa940', width: '66%' };
    return { label: 'Strong', color: '#52c41a', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const modalContent = (
    <div className="auth-overlay">
      <div className="auth-card glass-card">
        {onClose && (
           <button className="auth-close-btn" onClick={onClose}>×</button>
        )}
        
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Please log in to book your tickets.' : 'Sign up to secure your seats today.'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input 
                type="text" 
                className={`form-input ${name ? 'valid' : ''}`} 
                placeholder=" " 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
              <label className="form-label">Full Name</label>
            </div>
          )}

          <div className="form-group">
            <input 
              type="email" 
              className={`form-input ${email.includes('@') ? 'valid' : ''}`} 
              placeholder=" " 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <label className="form-label">Email Address</label>
          </div>

          <div className="form-group">
            <input 
              type="password" 
              className={`form-input ${password.length >= 6 ? 'valid' : ''}`} 
              placeholder=" " 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <label className="form-label">Password</label>
            {!isLogin && password && (
              <div className="strength-meter">
                <div className="strength-bar" style={{ width: strength.width, backgroundColor: strength.color }}></div>
                <span className="strength-text" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up here' : 'Login here'}
          </span>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default AuthModal;
