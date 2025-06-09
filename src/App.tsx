
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { NotificationsProvider } from '@/context/notifications';
import { ConsoleErrorLogger } from '@/components/debug/ConsoleErrorLogger';
import { EnhancedErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import CustomerVehicleDetails from '@/pages/CustomerVehicleDetails';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import Team from '@/pages/Team';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import { ShopOnboardingWizard } from '@/components/onboarding/ShopOnboardingWizard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import OnboardingGate from '@/components/onboarding/OnboardingGate';
import AuthGate from '@/components/AuthGate';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import CustomerPortal from '@/pages/CustomerPortal';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import Notifications from '@/pages/Notifications';
import './App.css';

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
                    <AuthGate>
                      <OnboardingGate>
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/customer-portal" element={<CustomerPortal />} />
                          <Route path="/customer-portal/login" element={<CustomerPortalLogin />} />
                          <Route path="/unauthorized" element={<Unauthorized />} />
                          <Route path="/onboarding" element={<ShopOnboardingWizard />} />
                          
                          {/* Protected Routes */}
                          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route index element={<Dashboard />} />
                            
                            {/* Customer Routes */}
                            <Route path="customers" element={<CustomersPage />} />
                            <Route path="customers/create" element={<CreateCustomer />} />
                            <Route path="customers/:id" element={<CustomerDetails />} />
                            <Route path="customers/:id/edit" element={<CustomerEdit />} />
                            <Route path="customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                            
                            {/* Work Order Routes */}
                            <Route path="work-orders" element={<WorkOrders />} />
                            <Route path="work-orders/:id" element={<WorkOrderDetails />} />
                            
                            {/* Inventory Routes */}
                            <Route path="inventory" element={<Inventory />} />
                            <Route path="inventory/add" element={<InventoryAdd />} />
                            
                            {/* Invoice Routes */}
                            <Route path="invoices" element={<Invoices />} />
                            <Route path="invoices/create" element={<InvoiceCreate />} />
                            <Route path="invoices/:id" element={<InvoiceDetails />} />
                            <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
                            
                            {/* Team Routes */}
                            <Route path="team" element={<Team />} />
                            <Route path="team/create" element={<TeamMemberCreate />} />
                            <Route path="team/:id" element={<TeamMemberProfile />} />
                            <Route path="team/roles" element={<TeamRoles />} />
                            
                            {/* Equipment & Maintenance */}
                            <Route path="equipment" element={<Equipment />} />
                            <Route path="equipment/:id" element={<EquipmentDetails />} />
                            <Route path="maintenance" element={<MaintenanceDashboard />} />
                            
                            {/* Reports & Settings */}
                            <Route path="reports" element={<Reports />} />
                            <Route path="settings/*" element={<Settings />} />
                            <Route path="notifications" element={<Notifications />} />
                          </Route>
                          
                          {/* Catch all route */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </OnboardingGate>
                    </AuthGate>
                  </Router>
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
