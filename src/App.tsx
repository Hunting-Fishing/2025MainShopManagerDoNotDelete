import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { NotificationsProvider } from '@/context/notifications';
import { ConsoleErrorLogger } from '@/components/debug/ConsoleErrorLogger';
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AuthRoutes } from '@/pages/AuthRoutes';
import { Dashboard } from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerCreate from '@/pages/CustomerCreate';
import CustomerEdit from '@/pages/CustomerEdit';
import CustomerPortal from '@/pages/CustomerPortal';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import Reminders from '@/pages/Reminders';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import ServiceCatalog from '@/pages/ServiceCatalog';
import ServiceCategory from '@/pages/ServiceCategory';
import ServiceSubcategory from '@/pages/ServiceSubcategory';
import ServiceJob from '@/pages/ServiceJob';
import CustomerServiceHistory from '@/pages/CustomerServiceHistory';
import { DatabaseInitializer } from '@/components/database/DatabaseInitializer';
import './i18n/config';
import './App.css';

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

function App() {
  const { isLoggedIn, isLoading } = useIsLoggedIn();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <HelmetProvider>
          <BrowserRouter>
            <DatabaseInitializer>
              <Toaster />
              <Routes>
                <Route path="/auth/*" element={!isLoggedIn ? <AuthRoutes /> : <Navigate to="/" />} />
                <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/auth/login" />} />
                <Route path="/customers" element={isLoggedIn ? <Customers /> : <Navigate to="/auth/login" />} />
                <Route path="/customers/:id" element={isLoggedIn ? <CustomerDetails /> : <Navigate to="/auth/login" />} />
                <Route path="/customers/create" element={isLoggedIn ? <CustomerCreate /> : <Navigate to="/auth/login" />} />
                <Route path="/customers/edit/:id" element={isLoggedIn ? <CustomerEdit /> : <Navigate to="/auth/login" />} />
                <Route path="/customer-portal" element={isLoggedIn ? <CustomerPortal /> : <Navigate to="/auth/login" />} />
                <Route path="/work-orders/*" element={isLoggedIn ? <WorkOrders /> : <Navigate to="/auth/login" />} />
                <Route path="/work-orders/create" element={isLoggedIn ? <WorkOrderCreate /> : <Navigate to="/auth/login" />} />
                <Route path="/work-orders/edit/:id" element={isLoggedIn ? <WorkOrderEdit /> : <Navigate to="/auth/login" />} />
                <Route path="/reminders" element={isLoggedIn ? <Reminders /> : <Navigate to="/auth/login" />} />
                <Route path="/settings/*" element={isLoggedIn ? <Settings /> : <Navigate to="/auth/login" />} />
                <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/auth/login" />} />
                <Route path="/service-catalog" element={isLoggedIn ? <ServiceCatalog /> : <Navigate to="/auth/login" />} />
                <Route path="/service-category" element={isLoggedIn ? <ServiceCategory /> : <Navigate to="/auth/login" />} />
                <Route path="/service-subcategory" element={isLoggedIn ? <ServiceSubcategory /> : <Navigate to="/auth/login" />} />
                <Route path="/service-job" element={isLoggedIn ? <ServiceJob /> : <Navigate to="/auth/login" />} />
                <Route path="/customer-service-history/:customerName" element={isLoggedIn ? <CustomerServiceHistory /> : <Navigate to="/auth/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </DatabaseInitializer>
          </BrowserRouter>
        </HelmetProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
