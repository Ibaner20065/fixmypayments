'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'login' ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121212',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          border: '8px solid #000',
          background: '#FFF',
          padding: '60px 40px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '8px 8px 0 #000',
        }}
      >
        <h1
          style={{
            fontFamily: 'Ranchers',
            fontSize: '56px',
            textTransform: 'uppercase',
            margin: '0 0 10px 0',
            lineHeight: 0.85,
          }}
        >
          FIXMYPAYMENTS
        </h1>

        <p
          style={{
            fontSize: '12px',
            color: '#475569',
            marginBottom: '30px',
            fontFamily: 'Plus Jakarta Sans',
            lineHeight: 1.6,
          }}
        >
          AI Personal Finance Assistant
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '30px',
          }}
        >
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            style={{
              padding: '12px 16px',
              border: mode === 'login' ? '4px solid #CCFF00' : '4px solid #000',
              background: mode === 'login' ? '#CCFF00' : '#FFF',
              fontFamily: 'Space Mono',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            style={{
              padding: '12px 16px',
              border: mode === 'signup' ? '4px solid #CCFF00' : '4px solid #000',
              background: mode === 'signup' ? '#CCFF00' : '#FFF',
              fontFamily: 'Space Mono',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Space Mono',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  color: '#000',
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '4px solid #000',
                  fontFamily: 'Space Mono',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'Space Mono',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '6px',
                color: '#000',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '4px solid #000',
                fontFamily: 'Space Mono',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'Space Mono',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '6px',
                color: '#000',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '4px solid #000',
                fontFamily: 'Space Mono',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '12px',
                border: '4px solid #FF0000',
                background: '#FFE0E0',
                fontFamily: 'Space Mono',
                fontSize: '12px',
                color: '#000',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              border: '4px solid #000',
              background: '#CCFF00',
              fontFamily: 'Space Mono',
              fontSize: '14px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '8px 8px 0 #000',
              transition: 'all 0.15s ease',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.transform = 'translate(4px, 4px)';
                (e.target as HTMLButtonElement).style.boxShadow = '4px 4px 0 #000';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.transform = 'translate(0, 0)';
                (e.target as HTMLButtonElement).style.boxShadow = '8px 8px 0 #000';
              }
            }}
          >
            {loading ? 'LOADING...' : mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}
