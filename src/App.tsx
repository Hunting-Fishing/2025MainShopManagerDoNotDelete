
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
import Index from '@/pages/Index';
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
import Login from '@/pages/Login';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import CustomerPortal from '@/pages/CustomerPortal';
import Reports from '@/pages/Reports';
import NotFound from '@/pages/NotFound';
import StaffLogin from '@/pages/StaffLogin';

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
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
            <Route path="/customer-portal/:customerId?" element={<CustomerPortal />} />
            <Route path="/auth" element={<Authentication />} />
            
            {/* Protected routes with Layout and Sidebar */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <CustomersPage />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/create"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <CreateCustomer />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <CustomerDetails />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id/edit"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <CustomerEdit />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/work-orders"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <WorkOrders />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/work-orders/:id"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <WorkOrderDetails />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Inventory />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/add"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <InventoryAdd />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Team />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/create"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <TeamMemberCreate />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/:id"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <TeamMemberProfile />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/roles"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <TeamRoles />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Settings />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/*"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Settings />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Invoices />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/create"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <InvoiceCreate />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <InvoiceDetails />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id/edit"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <InvoiceEdit />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reminders"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Reminders />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipment"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Equipment />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipment/:id"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <EquipmentDetails />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Notifications />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Layout>
                      <Reports />
                    </Layout>
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <ShopOnboardingWizard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
