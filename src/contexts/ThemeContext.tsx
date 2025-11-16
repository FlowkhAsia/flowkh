'use client';

import React, { createContext, useState, ReactNode, useContext } from 'react';

type Theme = 'red' | 'blue' | 'green' | 'purple' | 'cyan';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// FIX: Changed from React.FC to a standard function component with explicit children prop type.
// This can resolve subtle type inference issues in nested layouts within the Next.js App Router.
// FIX: Made children optional to resolve TS error in layout file.
export const ThemeProvider = ({ children }: { children?: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Fallback in case the inline script fails, though it shouldn't.
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('flowkh-theme') as Theme) || 'red';
    }
    return 'red';
  });

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem('flowkh-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
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
