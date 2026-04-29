'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: 48, height: 48, background: 'var(--d-black)', border: 'var(--d-border)' }} />;
  }

  return (
    <button
      onClick={toggleTheme}
      id="theme-toggle"
      style={{
        width: 48,
        height: 48,
        background: 'var(--d-black)',
        color: 'var(--d-volt)',
        border: 'var(--d-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'var(--d-shadow-sm)',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(2px, 2px)';
        e.currentTarget.style.boxShadow = '0 0 0 transparent';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translate(0, 0)';
        e.currentTarget.style.boxShadow = 'var(--d-shadow-sm)';
      }}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
