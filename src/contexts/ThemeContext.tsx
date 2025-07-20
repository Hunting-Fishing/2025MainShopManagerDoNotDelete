
import React, { createContext, useContext, useEffect, useState } from 'react';
import { appearanceService } from '@/services/settings/appearanceService';
import { useToast } from '@/hooks/use-toast';

interface ThemeSettings {
  theme_mode: 'light' | 'dark' | 'auto';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  loading: boolean;
  updateTheme: (updates: Partial<ThemeSettings>) => Promise<void>;
  applyTheme: () => void;
}

const defaultSettings: ThemeSettings = {
  theme_mode: 'light',
  primary_color: '#0f172a',
  secondary_color: '#64748b',
  accent_color: '#3b82f6',
  font_family: 'Inter'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Apply theme mode
    if (settings.theme_mode === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme_mode === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto mode - check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }

    // Apply custom colors as CSS variables
    root.style.setProperty('--primary', settings.primary_color);
    root.style.setProperty('--secondary', settings.secondary_color);
    root.style.setProperty('--accent', settings.accent_color);
    root.style.setProperty('--font-family', settings.font_family);
  };

  const loadThemeSettings = async () => {
    try {
      setLoading(true);
      // Mock shop ID for now - in real app this would come from auth context
      const shopId = 'default-shop-id';
      const themeSettings = await appearanceService.getAppearanceSettings(shopId);
      
      if (themeSettings) {
        setSettings({
          theme_mode: themeSettings.theme_mode,
          primary_color: themeSettings.primary_color || defaultSettings.primary_color,
          secondary_color: themeSettings.secondary_color || defaultSettings.secondary_color,
          accent_color: themeSettings.accent_color || defaultSettings.accent_color,
          font_family: themeSettings.font_family || defaultSettings.font_family
        });
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
      toast({
        title: "Theme Loading Error",
        description: "Failed to load theme settings, using defaults",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (updates: Partial<ThemeSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      
      // Mock shop ID for now
      const shopId = 'default-shop-id';
      
      // Try to get existing settings first
      let existingSettings = await appearanceService.getAppearanceSettings(shopId);
      
      if (existingSettings) {
        await appearanceService.updateAppearanceSettings(existingSettings.id, {
          theme_mode: newSettings.theme_mode,
          primary_color: newSettings.primary_color,
          secondary_color: newSettings.secondary_color,
          accent_color: newSettings.accent_color,
          font_family: newSettings.font_family
        });
      } else {
        await appearanceService.createAppearanceSettings({
          shop_id: shopId,
          theme_mode: newSettings.theme_mode,
          primary_color: newSettings.primary_color,
          secondary_color: newSettings.secondary_color,
          accent_color: newSettings.accent_color,
          font_family: newSettings.font_family
        });
      }

      toast({
        title: "Theme Updated",
        description: "Your theme settings have been saved successfully",
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
      toast({
        title: "Theme Update Error",
        description: "Failed to save theme settings",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadThemeSettings();
  }, []);

  useEffect(() => {
    applyTheme();
  }, [settings]);

  // Listen for system theme changes in auto mode
  useEffect(() => {
    if (settings.theme_mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme_mode]);

  return (
    <ThemeContext.Provider value={{ settings, loading, updateTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
