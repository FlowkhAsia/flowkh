import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

const themeColors = {
  red: '#E50914',
  blue: '#0071eb',
  green: '#1db954',
  purple: '#9b59b6',
  cyan: '#00acc1',
  yellow: '#f5c518',
};

type Theme = keyof typeof themeColors;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const faviconTemplate = (color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="${color}"/>
  <path d="M24 18 L46 32 L24 46 Z" fill="#ffffff" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
</svg>
`.trim().replace(/\n\s*/g, '');

const updateFavicon = (color: string) => {
  if (typeof window === 'undefined') return;
  const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
  if (!favicon) return;
  const svg = faviconTemplate(color);
  const encoded = window.btoa(svg);
  favicon.href = `data:image/svg+xml;base64,${encoded}`;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('flowkh-theme') as Theme) || 'cyan';
    }
    return 'cyan';
  });

  useEffect(() => {
    const currentTheme = localStorage.getItem('flowkh-theme') as Theme || 'cyan';
    updateFavicon(themeColors[currentTheme]);
  }, []);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem('flowkh-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      updateFavicon(themeColors[newTheme]);
      setThemeState(newTheme);
    } catch (e) {
      console.error("Failed to set theme in localStorage", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};