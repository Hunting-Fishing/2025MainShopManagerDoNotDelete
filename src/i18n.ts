
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language resources
const resources = {
  en: {
    translation: {
      // Add your translation keys here
      welcome: 'Welcome to our application',
      settings: {
        tabs: {
          account: 'Account',
          company: 'Company',
          security: 'Security',
          security_advanced: 'Advanced Security',
          notifications: 'Notifications',
          branding: 'Branding',
          appearance: 'Appearance',
          email: 'Email Settings',
          integrations: 'Integrations',
          loyalty: 'Loyalty',
          inventory: 'Inventory',
          team: 'Team History',
          email_scheduling: 'Email Scheduling',
          export: 'Data Export',
          language: 'Language'
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safe from XSS
    }
  });

export default i18n;
