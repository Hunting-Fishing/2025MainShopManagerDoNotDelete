import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { LanguageProvider } from '@/context/LanguageContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { NotificationsProvider } from '@/context/notifications';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { ConsoleErrorLogger } from '@/components/debug/ConsoleErrorLogger';
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';
import i18n from './i18n/config';
import App from './App';
import './index.css';
import '@fontsource/plus-jakarta-sans/latin.css';
import './styles/mobile.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const shouldDisableServiceWorker =
  typeof window !== 'undefined' && (
    window.location.hostname.includes('lovable.app') ||
    window.location.hostname.includes('lovableproject.com') ||
    window.location.search.includes('__lovable_token=')
  );

if ('serviceWorker' in navigator && shouldDisableServiceWorker) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
    .catch((error) => console.warn('Service worker unregister failed:', error));

  if ('caches' in window) {
    caches.keys()
      .then((cacheKeys) => Promise.all(
        cacheKeys.map((key) => caches.delete(key))
      ))
      .catch((error) => console.warn('Cache cleanup failed:', error));
  }
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <LanguageProvider>
              <ImpersonationProvider>
                <NotificationsProvider>
                  <CompanyProvider>
                    <BrowserRouter>
                      <ConsoleErrorLogger />
                      <App />
                    </BrowserRouter>
                  </CompanyProvider>
                </NotificationsProvider>
              </ImpersonationProvider>
            </LanguageProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
