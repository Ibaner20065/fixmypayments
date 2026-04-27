'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: 'fixmypayments',
    email: 'fixmypayments@example.com',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
        return;
      }

      setSuccess(data.message || 'Success!');
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* White background card */}
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brand}>
          <h1 style={styles.brandText}>FIXMYPAYMENT</h1>
          <p style={styles.brandSubtitle}>AI Personal Finance Assistant</p>
        </div>

        {/* Tab buttons */}
        <div style={styles.tabButtons}>
          <button
            onClick={() => {
              setIsLogin(true);
              setFormData(prev => ({ ...prev, password: '' }));
              setError('');
              setSuccess('');
            }}
            style={{
              ...styles.tabButton,
              ...(isLogin ? styles.tabButtonActive : styles.tabButtonInactive),
            }}
          >
            LOGIN
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setFormData(prev => ({ ...prev, password: '' }));
              setError('');
              setSuccess('');
            }}
            style={{
              ...styles.tabButton,
              ...(!isLogin ? styles.tabButtonActive : styles.tabButtonInactive),
            }}
          >
            SIGN UP
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>NAME</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>EMAIL</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>PASSWORD</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
              minLength={6}
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div style={styles.success}>
              {success}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'PROCESSING...' : isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Footer text */}
        <p style={styles.footerText}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData(prev => ({ ...prev, password: '' }));
              setError('');
              setSuccess('');
            }}
            style={styles.switchLink}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Space Mono', monospace",
  } as React.CSSProperties,

  card: {
    background: '#FFFFFF',
    border: '4px solid #000000',
    boxShadow: '12px 12px 0px #000000',
    padding: '60px 40px',
    maxWidth: 400,
    width: '100%',
  } as React.CSSProperties,

  brand: {
    marginBottom: 40,
    textAlign: 'center' as const,
  } as React.CSSProperties,

  brandText: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#000000',
    margin: '0 0 8px 0',
    letterSpacing: '0.05em',
  } as React.CSSProperties,

  brandSubtitle: {
    fontSize: '0.875rem',
    color: '#4A90E2',
    margin: 0,
    fontWeight: 400,
  } as React.CSSProperties,

  tabButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 32,
  } as React.CSSProperties,

  tabButton: {
    padding: '12px 16px',
    border: '4px solid #000000',
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  tabButtonActive: {
    background: '#CCFF00',
    color: '#000000',
  } as React.CSSProperties,

  tabButtonInactive: {
    background: '#FFFFFF',
    color: '#666666',
  } as React.CSSProperties,

  form: {
    marginBottom: 24,
  } as React.CSSProperties,

  formGroup: {
    marginBottom: 20,
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
    color: '#000000',
    letterSpacing: '0.1em',
  } as React.CSSProperties,

  input: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '12px 16px',
    border: '4px solid #000000',
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.875rem',
    background: '#FFFFFF',
    color: '#000000',
  } as React.CSSProperties,

  error: {
    background: '#FF4444',
    color: '#FFFFFF',
    border: '4px solid #CC0000',
    padding: '12px 16px',
    marginBottom: 20,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,

  success: {
    background: '#CCFF00',
    color: '#000000',
    border: '4px solid #000000',
    padding: '12px 16px',
    marginBottom: 20,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,

  submitButton: {
    width: '100%',
    padding: '14px 16px',
    background: '#CCFF00',
    border: '4px solid #000000',
    boxShadow: '4px 4px 0px #000000',
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  footerText: {
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    color: '#666666',
    margin: 0,
  } as React.CSSProperties,

  switchLink: {
    background: 'none',
    border: 'none',
    color: '#4A90E2',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.75rem',
    fontWeight: 700,
    textDecoration: 'underline',
    padding: 0,
  } as React.CSSProperties,
};
