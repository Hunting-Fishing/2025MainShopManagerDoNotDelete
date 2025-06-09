
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';

// Import pages
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CustomerDetails from '@/pages/CustomerDetails';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import Invoices from '@/pages/Invoices';
import InvoiceDetails from '@/pages/InvoiceDetails';
import Inventory from '@/pages/Inventory';
import Equipment from '@/pages/Equipment';
import Calendar from '@/pages/Calendar';
import Chat from '@/pages/Chat';
import Shopping from '@/pages/Shopping';
import Reports from '@/pages/Reports';
import Team from '@/pages/Team';
import Notifications from '@/pages/Notifications';
import Developer from '@/pages/Developer';
import Settings from '@/pages/Settings';

// Developer sub-pages
import { ServiceManagementPage } from '@/pages/developer/ServiceManagementPage';
import OrganizationManagement from '@/pages/developer/OrganizationManagement';
import ShoppingControls from '@/pages/developer/ShoppingControls';
import AnalyticsDashboard from '@/pages/developer/AnalyticsDashboard';
import UserManagement from '@/pages/developer/UserManagement';
import SecuritySettings from '@/pages/developer/SecuritySettings';
import SystemSettings from '@/pages/developer/SystemSettings';
import ToolsManagement from '@/pages/developer/ToolsManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/:id" element={<CustomerDetails />} />
                      <Route path="/work-orders" element={<WorkOrders />} />
                      <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/invoices/:id" element={<InvoiceDetails />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/shopping" element={<Shopping />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/developer" element={<Developer />} />
                      <Route path="/developer/service-management/*" element={<ServiceManagementPage />} />
                      <Route path="/developer/organization" element={<OrganizationManagement />} />
                      <Route path="/developer/shopping" element={<ShoppingControls />} />
                      <Route path="/developer/analytics" element={<AnalyticsDashboard />} />
                      <Route path="/developer/users" element={<UserManagement />} />
                      <Route path="/developer/security" element={<SecuritySettings />} />
                      <Route path="/developer/system" element={<SystemSettings />} />
                      <Route path="/developer/tools" element={<ToolsManagement />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Layout>
                </OnboardingGate>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
