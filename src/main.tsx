
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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
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
  </React.StrictMode>
);
