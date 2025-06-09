
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layout and Auth Components
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { ShopOnboardingWizard } from '@/components/onboarding/ShopOnboardingWizard';

// Page Components
import Dashboard from '@/pages/Dashboard';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import Team from '@/pages/Team';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import Settings from '@/pages/Settings';
import Invoices from '@/pages/Invoices';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Reminders from '@/pages/Reminders';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import Notifications from '@/pages/Notifications';
import Authentication from '@/pages/Authentication';
import Reports from '@/pages/Reports';
import NotFound from '@/pages/NotFound';

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
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Authentication />} />
            <Route path="/auth" element={<Authentication />} />
            
            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/customers" element={<CustomersPage />} />
                        <Route path="/customers/create" element={<CreateCustomer />} />
                        <Route path="/customers/:id" element={<CustomerDetails />} />
                        <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                        <Route path="/work-orders" element={<WorkOrders />} />
                        <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/inventory/add" element={<InventoryAdd />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/team/create" element={<TeamMemberCreate />} />
                        <Route path="/team/:id" element={<TeamMemberProfile />} />
                        <Route path="/team/roles" element={<TeamRoles />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/settings/*" element={<Settings />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/invoices/create" element={<InvoiceCreate />} />
                        <Route path="/invoices/:id" element={<InvoiceDetails />} />
                        <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                        <Route path="/reminders" element={<Reminders />} />
                        <Route path="/equipment" element={<Equipment />} />
                        <Route path="/equipment/:id" element={<EquipmentDetails />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/onboarding" element={<ShopOnboardingWizard />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <Toaster />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
