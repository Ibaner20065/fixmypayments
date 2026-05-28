'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Sun, Moon, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/lib/ThemeContext';

interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

function SettingsPageContent() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserSession['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Session check failed:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid var(--border-color)', padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Settings</h1>
          <Link
            href="/dashboard"
            style={{
              color: 'var(--accent-color)',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        {/* Profile Section */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <User size={24} /> Profile
          </h2>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              padding: 24,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Name
              </label>
              <div style={{ fontSize: '1.125rem', fontWeight: 500 }}>{user?.name || 'Loading...'}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Email
              </label>
              <div style={{ fontSize: '1.125rem', fontWeight: 500 }}>{user?.email || 'Loading...'}</div>
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
            Appearance
          </h2>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              padding: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Dark Mode</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Current theme: <strong>{theme === 'light' ? 'Light' : 'Dark'}</strong>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--accent-color)',
                color: '#000000',
                border: '2px solid #000000',
                padding: '12px 24px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.1s',
                fontSize: '0.875rem',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Toggle Theme
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <LogOut size={24} />
            Account
          </h2>
          <div
            style={{
              background: '#ffebee',
              border: '2px solid #ff6b6b',
              borderRadius: '8px',
              padding: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 500, color: '#c41c3b', marginBottom: 4 }}>Sign Out</div>
              <div style={{ fontSize: '0.875rem', color: '#666666' }}>End your current session</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: '#ff6b6b',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.1s',
                fontSize: '0.875rem',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <SettingsPageContent />;
}
