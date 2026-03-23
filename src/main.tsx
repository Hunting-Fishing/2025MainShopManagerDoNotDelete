import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { LanguageProvider } from '@/context/LanguageContext';
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

const CHUNK_RELOAD_GUARD_KEY = '__ab365_chunk_reload_once__';

const showBootFallback = (message: string) => {
  if (typeof document === 'undefined') return;

  const fallback = document.getElementById('boot-fallback') as HTMLElement | null;
  if (!fallback) return;

  const messageEl = fallback.querySelector('p') as HTMLElement | null;
  if (messageEl) {
    messageEl.textContent = message;
  }

  fallback.style.display = 'flex';
};

const isChunkLoadFailure = (message?: string) => {
  if (!message) return false;

  return (
    message.includes('ChunkLoadError') ||
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed')
  );
};

const tryChunkRecoveryReload = () => {
  try {
    const hasRetried = sessionStorage.getItem(CHUNK_RELOAD_GUARD_KEY) === '1';

    if (!hasRetried) {
      sessionStorage.setItem(CHUNK_RELOAD_GUARD_KEY, '1');
      window.location.reload();
      return true;
    }
  } catch {
    window.location.reload();
    return true;
  }

  showBootFallback('Loading failed. Try Reload or Clear Cache.');
  return false;
};

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

// Global chunk load error recovery
window.addEventListener('error', (e) => {
  if (isChunkLoadFailure(e.message)) {
    console.warn('Chunk load error detected, attempting one-time reload...');
    tryChunkRecoveryReload();
    return;
  }

  showBootFallback('The app failed to start. Please tap Reload.');
});

window.addEventListener('unhandledrejection', (e) => {
  const reasonMessage =
    typeof e.reason === 'string'
      ? e.reason
      : e.reason?.message || '';

  if (isChunkLoadFailure(reasonMessage)) {
    console.warn('Chunk load rejection detected, attempting one-time reload...');
    e.preventDefault?.();
    tryChunkRecoveryReload();
    return;
  }

  showBootFallback('The app failed to start. Please tap Reload.');
});

const AppWithBootReady: React.FC = () => {
  React.useEffect(() => {
    try {
      sessionStorage.removeItem(CHUNK_RELOAD_GUARD_KEY);
    } catch {
      // noop
    }

    if (typeof window !== 'undefined' && (window as any).__clearBootTimer) {
      (window as any).__clearBootTimer();
    }
  }, []);

  return (
    <GlobalErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <LanguageProvider>
              <BrowserRouter>
                <ConsoleErrorLogger />
                <App />
              </BrowserRouter>
            </LanguageProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </GlobalErrorBoundary>
  );
};

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppWithBootReady />
  </React.StrictMode>
);
