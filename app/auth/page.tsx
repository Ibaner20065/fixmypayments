'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase-client';

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
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // 1. Call our API to create Firebase Auth user + Firestore profile
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Signup failed');
          setLoading(false);
          return;
        }

        setSuccess('Account created! Signing you in…');

        // 2. Sign in client-side to get an ID token
        const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
        await updateProfile(credential.user, { displayName: name });
        const idToken = await credential.user.getIdToken();

        localStorage.setItem('fb-id-token', idToken);
        localStorage.setItem('fb-user', JSON.stringify({ id: credential.user.uid, email, name }));
        document.cookie = `fb-token=${idToken}; path=/; max-age=86400; SameSite=Lax`;

        router.push('/dashboard');
        return;
      }

      // LOGIN MODE
      // 0. Sanity check: is Firebase initialized?
      const auth = getFirebaseAuth();
      if (!auth.app.options.apiKey) {
        setError('⚙️ FIREBASE CLIENT ERROR: API Key missing. Please check your .env.local file.');
        setLoading(false);
        return;
      }

      // 1. Sign in client-side with Firebase
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      // 2. Verify with our server + get profile
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('fb-id-token', idToken);
      localStorage.setItem('fb-user', JSON.stringify(data.user));
      document.cookie = `fb-token=${idToken}; path=/; max-age=86400; SameSite=Lax`;

      router.push('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      let message = 'Something went wrong. Please try again.';
      if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      } else if (code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a moment and try again.';
      } else if (code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.';
      } else if (code === 'auth/configuration-not-found' || code === 'auth/invalid-api-key') {
        message = '⚙️ Firebase not fully configured yet — add NEXT_PUBLIC_FIREBASE_API_KEY + APP_ID to .env.local';
      }
      setError(message + (err?.message ? ` (${err.message})` : ''));
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('PLEASE ENTER YOUR EMAIL ADDRESS FIRST');
      return;
    }
    setError('');
    setSuccess('');
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      setSuccess('PASSWORD RESET EMAIL SENT! CHECK YOUR INBOX.');
    } catch (err: any) {
      setError(err?.message || 'FAILED TO SEND RESET EMAIL');
    } finally {
      setResetLoading(false);
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
          backgroundImage: 'radial-gradient(circle, #CCFF0015 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <Link href="/" style={{ display: 'block', textAlign: 'center', marginBottom: 40, textDecoration: 'none' }}>
          <div style={{ fontFamily: "'Ranchers', cursive", fontSize: '2rem', color: '#CCFF00', letterSpacing: '-0.02em' }}>
            FIXMYPAYMENTS
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.625rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 4 }}>
            AI FINANCE ASSISTANT
          </div>
        </Link>

        {/* Auth Card */}
        <div style={{ background: '#FFFFFF', border: '4px solid #000000', boxShadow: '12px 12px 0px 0px #CCFF00' }}>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', borderBottom: '4px solid #000000' }}>
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '16px 0', border: 'none', borderRight: '2px solid #000000',
                background: mode === 'login' ? '#000000' : '#FFFFFF',
                color: mode === 'login' ? '#CCFF00' : '#000000',
                fontFamily: "'Space Mono', monospace", fontSize: '0.8125rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '16px 0', border: 'none', borderLeft: '2px solid #000000',
                background: mode === 'signup' ? '#000000' : '#FFFFFF',
                color: mode === 'signup' ? '#CCFF00' : '#000000',
                fontFamily: "'Space Mono', monospace", fontSize: '0.8125rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s ease',
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
                <label htmlFor="auth-name" style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, color: '#000' }}>
                  NAME
                </label>
                <input
                  id="auth-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" required
                  style={{ width: '100%', padding: '14px 16px', border: '3px solid #000000', background: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', color: '#000', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => (e.target.style.boxShadow = '4px 4px 0px 0px #CCFF00')}
                  onBlur={(e) => (e.target.style.boxShadow = 'none')}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="auth-email" style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, color: '#000' }}>
                EMAIL
              </label>
              <input
                id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{ width: '100%', padding: '14px 16px', border: '3px solid #000000', background: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', color: '#000', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.boxShadow = '4px 4px 0px 0px #CCFF00')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label htmlFor="auth-password" style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, color: '#000' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  required minLength={6}
                  style={{ width: '100%', padding: '14px 48px 14px 16px', border: '3px solid #000000', background: '#FFFFFF', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', color: '#000', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => (e.target.style.boxShadow = '4px 4px 0px 0px #CCFF00')}
                  onBlur={(e) => (e.target.style.boxShadow = 'none')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0, display: 'flex' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: resetLoading ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {resetLoading ? 'SENDING...' : 'FORGOT PASSWORD?'}
                  </button>
                </div>
              )}
            </div>

            {/* Error / Success */}
            {error && (
              <div style={{ background: '#ff000010', border: '3px solid #ff0000', padding: '12px 16px', marginBottom: 20, fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', fontWeight: 700, color: '#cc0000', textTransform: 'uppercase' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: '#ecfccb', border: '3px solid #65a30d', padding: '12px 16px', marginBottom: 20, fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', fontWeight: 700, color: '#3f6212', textTransform: 'uppercase' }}>
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '16px 24px', background: loading ? '#333' : '#CCFF00', color: '#000000', border: '4px solid #000000', boxShadow: loading ? 'none' : '6px 6px 0px 0px #000000', fontFamily: "'Space Mono', monospace", fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.15s ease' }}
              onMouseDown={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(3px, 3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0px 0px #000000'; } }}
              onMouseUp={(e) => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px #000000'; } }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
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

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: 24, fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', color: '#555' }}>
          {mode === 'login' ? (
            <>No account?{' '}<button onClick={() => { setMode('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: '#CCFF00', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>SIGN UP FREE</button></>
          ) : (
            <>Already have an account?{' '}<button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: '#CCFF00', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>LOG IN</button></>
          )}
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
