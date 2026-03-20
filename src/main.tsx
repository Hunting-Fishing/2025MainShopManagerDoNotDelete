import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
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
                      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
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
