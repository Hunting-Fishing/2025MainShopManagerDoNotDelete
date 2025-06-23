
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { NotificationsProvider } from '@/context/notifications';
import { ConsoleErrorLogger } from '@/components/debug/ConsoleErrorLogger';
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';
import App from './App';
import './App.css';

// Optimized query client configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
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
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <ImpersonationProvider>
              <NotificationsProvider>
                <BrowserRouter>
                  <GlobalErrorBoundary>
                    <ConsoleErrorLogger />
                    <App />
                    <ReactQueryDevtools 
                      initialIsOpen={false} 
                      position="bottom-right"
                    />
                  </GlobalErrorBoundary>
                </BrowserRouter>
              </NotificationsProvider>
            </ImpersonationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
