
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import AuthGate from '@/components/AuthGate';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import Inventory from '@/pages/Inventory';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import Team from '@/pages/Team';
import Reports from '@/pages/Reports';
import Notifications from '@/pages/Notifications';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import ErrorPage from '@/pages/error-page';

// Settings pages
import CompanySettings from '@/pages/settings/CompanySettings';
import AppearanceSettings from '@/pages/settings/AppearanceSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/error" element={<ErrorPage />} />
              
              {/* Protected routes */}
              <Route
                path="/*"
                element={
                  <AuthGate>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/customers" element={<CustomersPage />} />
                        <Route path="/customers/create" element={<CreateCustomer />} />
                        <Route path="/customers/:id" element={<CustomerDetails />} />
                        <Route path="/work-orders" element={<WorkOrders />} />
                        <Route path="/work-orders/create" element={<WorkOrderCreate />} />
                        <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                        <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/equipment" element={<Equipment />} />
                        <Route path="/equipment/:id" element={<EquipmentDetails />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/settings/company" element={<CompanySettings />} />
                        <Route path="/settings/appearance" element={<AppearanceSettings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </AuthGate>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
