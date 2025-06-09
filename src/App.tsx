import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { AuthGate } from '@/components/AuthGate';
import { OnboardingRedirectGate } from '@/components/onboarding/OnboardingRedirectGate';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import Team from '@/pages/Team';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import { ShopOnboardingWizard } from '@/components/onboarding/ShopOnboardingWizard';
import NotFound from '@/pages/NotFound';
import VehicleInspectionForm from '@/pages/VehicleInspectionForm';
import Calendar from '@/pages/Calendar';
import Analytics from '@/pages/Analytics';
import Reminders from '@/pages/Reminders';
import RepairPlans from '@/pages/RepairPlans';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import TeamRoles from '@/pages/TeamRoles';
import Notifications from '@/pages/Notifications';
import CustomerPortal from '@/pages/CustomerPortal';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
  onError: (error) => {
    console.error("Unhandled react-query error:", error);
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ImpersonationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/customer-portal" element={<CustomerPortal />} />
            <Route path="/customer-login" element={<CustomerPortalLogin />} />
            <Route path="/onboarding" element={<ShopOnboardingWizard />} />
            <Route path="/inspection/:workOrderId" element={<VehicleInspectionForm />} />
            <Route path="/*" element={
              <AuthGate>
                <OnboardingRedirectGate>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/work-orders" element={<WorkOrders />} />
                    <Route path="/work-orders/create" element={<WorkOrderCreate />} />
                    <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                    <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/inventory/add" element={<InventoryAdd />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/create" element={<InvoiceCreate />} />
                    <Route path="/invoices/:id" element={<InvoiceDetails />} />
                    <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/team/create" element={<TeamMemberCreate />} />
                    <Route path="/team/:id" element={<TeamMemberProfile />} />
                    <Route path="/team/roles" element={<TeamRoles />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/create" element={<CreateCustomer />} />
                    <Route path="/customers/:id" element={<CustomerDetails />} />
                    <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                    <Route path="/equipment" element={<Equipment />} />
                    <Route path="/equipment/:id" element={<EquipmentDetails />} />
                    <Route path="/maintenance" element={<MaintenanceDashboard />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings/*" element={<Settings />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reminders" element={<Reminders />} />
                    <Route path="/repair-plans" element={<RepairPlans />} />
                    <Route path="/repair-plans/create" element={<CreateRepairPlan />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </OnboardingRedirectGate>
              </AuthGate>
            } />
          </Routes>
          <Toaster />
        </Router>
      </ImpersonationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
