
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationsProvider } from '@/context/notifications';

// Import Inter font weights
import '@fontsource/inter/100.css';  // Thin
import '@fontsource/inter/200.css';  // Extra Light
import '@fontsource/inter/300.css';  // Light
import '@fontsource/inter/400.css';  // Regular
import '@fontsource/inter/500.css';  // Medium
import '@fontsource/inter/600.css';  // Semi-bold
import '@fontsource/inter/700.css';  // Bold
import '@fontsource/inter/800.css';  // Extra Bold
import '@fontsource/inter/900.css';  // Black

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
