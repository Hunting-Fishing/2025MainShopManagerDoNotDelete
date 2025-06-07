
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Update the theme in localStorage and apply it to the document
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Handle different theme settings
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      setResolvedTheme('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      setResolvedTheme('light');
    } else if (theme === 'auto') {
      // For auto, use system preference
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        document.documentElement.classList.add('dark');
        setResolvedTheme('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setResolvedTheme('light');
      }
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          setResolvedTheme('dark');
        } else {
          document.documentElement.classList.remove('dark');
          setResolvedTheme('light');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
