import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import CustomerVehicleDetails from '@/pages/CustomerVehicleDetails';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import InventoryEdit from '@/pages/InventoryEdit';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Team from '@/pages/Team';
import TeamCreate from '@/pages/TeamCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import Calendar from '@/pages/Calendar';
import Chat from '@/pages/Chat';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import Maintenance from '@/pages/Maintenance';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Onboarding from '@/pages/Onboarding';
import Developer from '@/pages/Developer';
import Analytics from '@/pages/Analytics';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import RepairPlanDetails from '@/pages/RepairPlanDetails';
import ClientBooking from '@/pages/ClientBooking';
import CustomerPortal from '@/pages/CustomerPortal';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import AffiliateTool from '@/pages/AffiliateTool';
import FeedbackForm from '@/pages/FeedbackForm';
import FeedbackAnalytics from '@/pages/FeedbackAnalytics';
import NotificationsPage from '@/pages/NotificationsPage';
import Authentication from '@/pages/Authentication';
import { AuthGate } from '@/components/AuthGate';

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ImpersonationProvider>
            <NotificationsProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth" element={<Authentication />} />
                  <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
                  <Route path="/customer-portal" element={<CustomerPortal />} />
                  <Route path="/booking/:shopSlug" element={<ClientBooking />} />
                  <Route path="/feedback/:formId" element={<FeedbackForm />} />
                  
                  {/* Protected routes */}
                  <Route path="/*" element={
                    <AuthGate>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/onboarding" element={<Onboarding />} />
                          
                          {/* Customer routes */}
                          <Route path="/customers" element={<CustomersPage />} />
                          <Route path="/customers/create" element={<CreateCustomer />} />
                          <Route path="/customers/:id" element={<CustomerDetails />} />
                          <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                          <Route path="/customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                          
                          {/* Work Order routes */}
                          <Route path="/work-orders" element={<WorkOrders />} />
                          <Route path="/work-orders/create" element={<WorkOrderCreate />} />
                          <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                          <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />
                          
                          {/* Inventory routes */}
                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/inventory/add" element={<InventoryAdd />} />
                          <Route path="/inventory/:id/edit" element={<InventoryEdit />} />
                          
                          {/* Invoice routes */}
                          <Route path="/invoices" element={<Invoices />} />
                          <Route path="/invoices/create" element={<InvoiceCreate />} />
                          <Route path="/invoices/:id" element={<InvoiceDetails />} />
                          <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                          
                          {/* Team routes */}
                          <Route path="/team" element={<Team />} />
                          <Route path="/team/create" element={<TeamCreate />} />
                          <Route path="/team/:id" element={<TeamMemberProfile />} />
                          <Route path="/team/roles" element={<TeamRoles />} />
                          
                          {/* Equipment routes */}
                          <Route path="/equipment" element={<Equipment />} />
                          <Route path="/equipment/:id" element={<EquipmentDetails />} />
                          
                          {/* Repair Plan routes */}
                          <Route path="/repair-plans/create" element={<CreateRepairPlan />} />
                          <Route path="/repair-plans/:id" element={<RepairPlanDetails />} />
                          
                          {/* Other routes */}
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/chat" element={<Chat />} />
                          <Route path="/maintenance" element={<Maintenance />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/developer" element={<Developer />} />
                          <Route path="/shopping" element={<AffiliateTool />} />
                          <Route path="/feedback/analytics/:formId" element={<FeedbackAnalytics />} />
                        </Routes>
                      </Layout>
                    </AuthGate>
                  } />
                </Routes>
              </Router>
              <Toaster />
              <ReactQueryDevtools initialIsOpen={false} />
            </NotificationsProvider>
          </ImpersonationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
