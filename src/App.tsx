
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { SidebarProvider } from '@/hooks/use-sidebar';
import { ThemeProvider } from '@/hooks/use-theme';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Import pages
import Login from '@/pages/Login';
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
import LandingPage from '@/pages/LandingPage';

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
                <Router>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/customer-portal" element={<CustomerPortal />} />
                    <Route path="/client-booking" element={<ClientBooking />} />
                    
                    {/* Protected routes with dashboard layout */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Dashboard />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/work-orders" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <WorkOrders />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/calendar" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Calendar />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/inventory" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Inventory />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/customers" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Customers />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/reports" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Reports />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/maintenance" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Maintenance />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Settings />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Settings sub-routes */}
                    <Route path="/settings/branding" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <BrandingSettings />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings/company" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <CompanySettings />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings/appearance" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <AppearanceSettings />
                        </DashboardLayout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Router>
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
