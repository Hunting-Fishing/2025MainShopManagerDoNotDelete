
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { SidebarProvider } from '@/hooks/use-sidebar';
import { ThemeProvider } from 'next-themes';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Import pages
import Login from '@/pages/Login';
import StaffLogin from '@/pages/StaffLogin';
import Dashboard from '@/pages/Dashboard';
import WorkOrders from '@/pages/WorkOrders';
import Calendar from '@/pages/Calendar';
import Inventory from '@/pages/Inventory';
import Customers from '@/pages/Customers';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Maintenance from '@/pages/Maintenance';
import CustomerPortal from '@/pages/CustomerPortal';
import ClientBooking from '@/pages/ClientBooking';
import Index from '@/pages/Index';

// Settings sub-pages
import BrandingSettings from '@/pages/settings/BrandingSettings';
import CompanySettings from '@/pages/settings/CompanySettings';
import AppearanceSettings from '@/pages/settings/AppearanceSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CompanyProvider>
            <ImpersonationProvider>
              <SidebarProvider>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/staff-login" element={<StaffLogin />} />
                    <Route path="/customer-portal" element={<CustomerPortal />} />
                    <Route path="/client-booking" element={<ClientBooking />} />
                    
                    {/* Protected routes with dashboard layout */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/work-orders" element={
                      <ProtectedRoute>
                        <Layout>
                          <WorkOrders />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/calendar" element={
                      <ProtectedRoute>
                        <Layout>
                          <Calendar />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/inventory" element={
                      <ProtectedRoute>
                        <Layout>
                          <Inventory />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/customers" element={
                      <ProtectedRoute>
                        <Layout>
                          <Customers />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/reports" element={
                      <ProtectedRoute>
                        <Layout>
                          <Reports />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/maintenance" element={
                      <ProtectedRoute>
                        <Layout>
                          <Maintenance />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Settings sub-routes */}
                    <Route path="/settings/branding" element={
                      <ProtectedRoute>
                        <Layout>
                          <BrandingSettings />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings/company" element={
                      <ProtectedRoute>
                        <Layout>
                          <CompanySettings />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings/appearance" element={
                      <ProtectedRoute>
                        <Layout>
                          <AppearanceSettings />
                        </Layout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                <Toaster />
                <ReactQueryDevtools initialIsOpen={false} />
              </SidebarProvider>
            </ImpersonationProvider>
          </CompanyProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
