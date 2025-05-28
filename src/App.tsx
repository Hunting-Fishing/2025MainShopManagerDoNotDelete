
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Layout } from '@/components/layout/Layout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { CustomerDataProvider } from '@/contexts/CustomerDataProvider';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { ReactErrorBoundary } from '@/components/error/ReactErrorBoundary';

// Page imports
import Dashboard from '@/pages/Dashboard';
import CustomersPage from '@/pages/CustomersPage';
import CustomerDetailsPage from '@/pages/CustomerDetails';
import EquipmentPage from '@/pages/Equipment';
import InventoryPage from '@/pages/Inventory';
import WorkOrdersPage from '@/pages/WorkOrders';
import InvoicesPage from '@/pages/Invoices';
import TeamPage from '@/pages/Team';
import Settings from '@/pages/Settings';
import DeveloperPortal from '@/pages/DeveloperPortal';

// Developer Portal Pages
import ServiceManagement from '@/pages/developer/ServiceManagement';
import OrganizationManagement from '@/pages/developer/OrganizationManagement';
import ShoppingControls from '@/pages/developer/ShoppingControls';
import UserManagement from '@/pages/developer/UserManagement';
import SystemSettings from '@/pages/developer/SystemSettings';
import ToolsManagement from '@/pages/developer/ToolsManagement';
import AnalyticsDashboard from '@/pages/developer/AnalyticsDashboard';
import SecuritySettings from '@/pages/developer/SecuritySettings';

// Settings Pages
import IntegrationsSettings from '@/pages/settings/IntegrationsSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

function App() {
  return (
    <ReactErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationsProvider>
              <ImpersonationProvider>
                <CustomerDataProvider>
                  <Router>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/customers" element={<CustomersPage />} />
                        <Route path="/customers/:id" element={<CustomerDetailsPage />} />
                        <Route path="/equipment" element={<EquipmentPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/work-orders" element={<WorkOrdersPage />} />
                        <Route path="/invoices" element={<InvoicesPage />} />
                        <Route path="/team" element={<TeamPage />} />
                        <Route path="/settings" element={<Settings />} />
                        
                        {/* Settings Routes */}
                        <Route path="/settings/integrations" element={<IntegrationsSettings />} />
                        
                        {/* Developer Portal Routes */}
                        <Route path="/developer" element={<DeveloperPortal />} />
                        <Route path="/developer/service-management" element={<ServiceManagement />} />
                        <Route path="/developer/organization-management" element={<OrganizationManagement />} />
                        <Route path="/developer/shopping-controls" element={<ShoppingControls />} />
                        <Route path="/developer/user-management" element={<UserManagement />} />
                        <Route path="/developer/system-settings" element={<SystemSettings />} />
                        <Route path="/developer/tools-management" element={<ToolsManagement />} />
                        <Route path="/developer/analytics-dashboard" element={<AnalyticsDashboard />} />
                        <Route path="/developer/security-settings" element={<SecuritySettings />} />
                      </Routes>
                    </Layout>
                    <Toaster />
                  </Router>
                </CustomerDataProvider>
              </ImpersonationProvider>
            </NotificationsProvider>
          </LanguageProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReactErrorBoundary>
  );
}

export default App;
