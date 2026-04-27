// Theme context and utilities for dark/light mode
// Uses localStorage to persist user preference

export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  current: Theme;
  toggle: () => void;
  isDark: boolean;
}

export const THEME_KEY = 'fixmypayments_theme';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY);
  return (stored as Theme) || 'light';
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// Color palette for both themes
export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    border: '#000000',
    text: '#121212',
    textSecondary: '#475569',
    accent: '#CCFF00',
    cardBg: '#FFFFFF',
    inputBg: '#F5F5F5',
  },
  dark: {
    background: '#121212',
    surface: '#1A1A1A',
    border: '#333333',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    accent: '#CCFF00',
    cardBg: '#1A1A1A',
    inputBg: '#0D0D0D',
  },
};

export const shadows = {
  neo: {
    light: '8px 8px 0px #000000',
    dark: '8px 8px 0px #FFFFFF',
  },
};

export function getThemeColors(theme: Theme) {
  return colors[theme];
}
