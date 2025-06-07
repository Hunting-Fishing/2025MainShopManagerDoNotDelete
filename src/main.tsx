
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { NotificationsProvider } from '@/context/notifications';
import { ConsoleErrorLogger } from '@/components/debug/ConsoleErrorLogger';
import { EnhancedErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import App from './App';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <EnhancedErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <ImpersonationProvider>
                <NotificationsProvider>
                  <ConsoleErrorLogger />
                  <App />
                  <ReactQueryDevtools initialIsOpen={false} />
                </NotificationsProvider>
              </ImpersonationProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </EnhancedErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
