'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        mode === 'login'
          ? { email, password }
          : { email, password, name };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (mode === 'signup' && !data.session?.access_token) {
        setSuccess('Account created. Please verify your email, then log in.');
        setMode('login');
        setPassword('');
        setLoading(false);
        return;
      }

      // Store session token
      if (data.session?.access_token) {
        localStorage.setItem('sb-access-token', data.session.access_token);
        localStorage.setItem('sb-refresh-token', data.session.refresh_token);
      }

      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* Dot pattern background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, #CCFF0015 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: 'block',
            textAlign: 'center',
            marginBottom: 40,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              fontFamily: "'Ranchers', cursive",
              fontSize: '2rem',
              color: '#CCFF00',
              letterSpacing: '-0.02em',
            }}
          >
            FIXMYPAYMENTS
          </div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.625rem',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginTop: 4,
            }}
          >
            AI FINANCE ASSISTANT
          </div>
        </Link>

        {/* Auth Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '4px solid #000000',
            boxShadow: '12px 12px 0px 0px #CCFF00',
          }}
        >
          {/* Tab Switcher */}
          <div style={{ display: 'flex', borderBottom: '4px solid #000000' }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                flex: 1,
                padding: '16px 0',
                border: 'none',
                borderRight: '2px solid #000000',
                background: mode === 'login' ? '#000000' : '#FFFFFF',
                color: mode === 'login' ? '#CCFF00' : '#000000',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              style={{
                flex: 1,
                padding: '16px 0',
                border: 'none',
                borderLeft: '2px solid #000000',
                background: mode === 'signup' ? '#000000' : '#FFFFFF',
                color: mode === 'signup' ? '#CCFF00' : '#000000',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              SIGN UP
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: 32 }}>
            {/* Name (signup only) */}
            {mode === 'signup' && (
              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="auth-name"
                  style={{
                    display: 'block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 8,
                    color: '#000',
                  }}
                >
                  NAME
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '3px solid #000000',
                    background: '#FFFFFF',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1rem',
                    color: '#000',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.boxShadow = '4px 4px 0px 0px #CCFF00')}
                  onBlur={(e) => (e.target.style.boxShadow = 'none')}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="auth-email"
                style={{
                  display: 'block',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 8,
                  color: '#000',
                }}
              >
                EMAIL
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '3px solid #000000',
                  background: '#FFFFFF',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '1rem',
                  color: '#000',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'box-shadow 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.boxShadow = '4px 4px 0px 0px #CCFF00')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label
                htmlFor="auth-password"
                style={{
                  display: 'block',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 8,
                  color: '#000',
                }}
              >
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    border: '3px solid #000000',
                    background: '#FFFFFF',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1rem',
                    color: '#000',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.boxShadow = '4px 4px 0px 0px #CCFF00')}
                  onBlur={(e) => (e.target.style.boxShadow = 'none')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    padding: 0,
                    display: 'flex',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: '#ff000010',
                  border: '3px solid #ff0000',
                  padding: '12px 16px',
                  marginBottom: 20,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#cc0000',
                  textTransform: 'uppercase',
                }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                style={{
                  background: '#ecfccb',
                  border: '3px solid #65a30d',
                  padding: '12px 16px',
                  marginBottom: 20,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#3f6212',
                  textTransform: 'uppercase',
                }}
              >
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: loading ? '#333' : '#CCFF00',
                color: '#000000',
                border: '4px solid #000000',
                boxShadow: loading ? 'none' : '6px 6px 0px 0px #000000',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.15s ease',
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(3px, 3px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0px 0px #000000';
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px #000000';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  PROCESSING...
                </>
              ) : (
                <>
                  {mode === 'login' ? 'ENTER DASHBOARD' : 'CREATE ACCOUNT'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 24,
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.6875rem',
            color: '#555',
          }}
        >
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#CCFF00',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                SIGN UP FREE
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#CCFF00',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                LOG IN
              </button>
            </>
          )}
        </div>

        {/* Spin keyframes */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
