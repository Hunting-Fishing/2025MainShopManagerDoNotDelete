import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { NotificationsProvider } from '@/context/notifications';
import { ConsoleErrorLogger } from '@/components/debug/ConsoleErrorLogger';
import { EnhancedErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';

// Import pages
import Login from '@/pages/Login';
import Authentication from '@/pages/Authentication';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import Signup from '@/pages/Signup';
import Layout from '@/components/layout/Layout';

// Import all dashboard pages
import Dashboard from '@/pages/Dashboard';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import WorkOrdersPage from '@/pages/WorkOrdersPage';
import CreateWorkOrder from '@/pages/CreateWorkOrder';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import EditWorkOrder from '@/pages/EditWorkOrder';
import InventoryPage from '@/pages/InventoryPage';
import CreateInventoryItem from '@/pages/CreateInventoryItem';
import EditInventoryItem from '@/pages/EditInventoryItem';
import InvoicesPage from '@/pages/InvoicesPage';
import CreateInvoice from '@/pages/CreateInvoice';
import InvoiceDetails from '@/pages/InvoiceDetails';
import EditInvoice from '@/pages/EditInvoice';
import TeamPage from '@/pages/TeamPage';
import CreateTeamMember from '@/pages/CreateTeamMember';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import EditTeamMember from '@/pages/EditTeamMember';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import Calendar from '@/pages/Calendar';
import CustomerPortal from '@/pages/CustomerPortal';
import EquipmentPage from '@/pages/EquipmentPage';
import EquipmentDetails from '@/pages/EquipmentDetails';
import MaintenancePage from '@/pages/MaintenancePage';
import ReportsPage from '@/pages/ReportsPage';
import Chat from '@/pages/Chat';
import Onboarding from '@/pages/Onboarding';
import AffiliateTool from '@/pages/AffiliateTool';

// Create a client
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
      <EnhancedErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <ImpersonationProvider>
                <NotificationsProvider>
                  <ConsoleErrorLogger />
                  <Router>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/auth" element={<Authentication />} />
                      <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
                      <Route path="/signup" element={<Signup />} />
                      
                      {/* Root redirect */}
                      <Route path="/" element={<Navigate to="/login" replace />} />
                      
                      {/* Protected routes with Layout */}
                      <Route path="/*" element={
                        <ProtectedRoute>
                          <Layout>
                            <Routes>
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/onboarding" element={<Onboarding />} />
                              
                              {/* Customer routes */}
                              <Route path="/customers" element={<CustomersPage />} />
                              <Route path="/customers/create" element={<CreateCustomer />} />
                              <Route path="/customers/:id" element={<CustomerDetails />} />
                              <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                              
                              {/* Work Order routes */}
                              <Route path="/work-orders" element={<WorkOrdersPage />} />
                              <Route path="/work-orders/create" element={<CreateWorkOrder />} />
                              <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                              <Route path="/work-orders/:id/edit" element={<EditWorkOrder />} />
                              
                              {/* Inventory routes */}
                              <Route path="/inventory" element={<InventoryPage />} />
                              <Route path="/inventory/create" element={<CreateInventoryItem />} />
                              <Route path="/inventory/:id/edit" element={<EditInventoryItem />} />
                              
                              {/* Invoice routes */}
                              <Route path="/invoices" element={<InvoicesPage />} />
                              <Route path="/invoices/create" element={<CreateInvoice />} />
                              <Route path="/invoices/:id" element={<InvoiceDetails />} />
                              <Route path="/invoices/:id/edit" element={<EditInvoice />} />
                              
                              {/* Team routes */}
                              <Route path="/team" element={<TeamPage />} />
                              <Route path="/team/create" element={<CreateTeamMember />} />
                              <Route path="/team/:id" element={<TeamMemberProfile />} />
                              <Route path="/team/:id/edit" element={<EditTeamMember />} />
                              
                              {/* Equipment & Maintenance */}
                              <Route path="/equipment" element={<EquipmentPage />} />
                              <Route path="/equipment/:id" element={<EquipmentDetails />} />
                              <Route path="/maintenance" element={<MaintenancePage />} />
                              
                              {/* Other routes */}
                              <Route path="/settings/*" element={<Settings />} />
                              <Route path="/analytics" element={<Analytics />} />
                              <Route path="/calendar" element={<Calendar />} />
                              <Route path="/customer-portal" element={<CustomerPortal />} />
                              <Route path="/reports" element={<ReportsPage />} />
                              <Route path="/chat" element={<Chat />} />
                              <Route path="/affiliate-tool" element={<AffiliateTool />} />
                            </Routes>
                          </Layout>
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </Router>
                  <Toaster />
                  <ReactQueryDevtools initialIsOpen={false} />
                </NotificationsProvider>
              </ImpersonationProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </EnhancedErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
