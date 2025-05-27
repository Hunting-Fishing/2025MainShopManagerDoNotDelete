
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'semantic-ui-css/semantic.min.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { NotificationsProvider } from '@/context/notifications';
import { Toaster } from "sonner";
import { ConsoleErrorLogger } from '@/components/debug/ConsoleErrorLogger';
import { EnhancedErrorBoundary } from '@/components/error/EnhancedErrorBoundary';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <EnhancedErrorBoundary maxRetries={3} isolateOnError={true}>
      <ConsoleErrorLogger />
      <ThemeProvider>
        <LanguageProvider>
          <ImpersonationProvider>
            <NotificationsProvider>
              <App />
              <Toaster position="top-right" richColors closeButton />
            </NotificationsProvider>
          </ImpersonationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </EnhancedErrorBoundary>
  </React.StrictMode>
);
