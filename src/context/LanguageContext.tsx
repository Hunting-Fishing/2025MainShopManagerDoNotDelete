
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import i18n from '@/i18n/config';

type LanguageContextType = {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  languages: { code: string; name: string }[];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get saved language from localStorage or use default
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  };

  // Initialize i18n language on mount
  useEffect(() => {
    if (i18n.isInitialized) {
      i18n.changeLanguage(currentLanguage);
    } else {
      i18n.on('initialized', () => {
        i18n.changeLanguage(currentLanguage);
      });
    }
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};
