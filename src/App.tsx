
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';

// Import pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import WorkOrdersPage from '@/pages/WorkOrdersPage';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import EditCustomer from '@/pages/EditCustomer';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import InventoryStock from '@/pages/InventoryStock';
import InventoryCategories from '@/pages/InventoryCategories';
import InventoryLocations from '@/pages/InventoryLocations';
import InventoryOrders from '@/pages/InventoryOrders';
import InventorySuppliers from '@/pages/InventorySuppliers';
import InventoryManager from '@/pages/InventoryManager';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import Team from '@/pages/Team';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import CreateTeamMember from '@/pages/CreateTeamMember';
import Reports from '@/pages/Reports';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import CreateInvoice from '@/pages/CreateInvoice';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import RepairPlans from '@/pages/RepairPlans';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import RepairPlanDetails from '@/pages/RepairPlanDetails';
import ServiceReminders from '@/pages/ServiceReminders';
import CustomerFollowUps from '@/pages/CustomerFollowUps';
import Calendar from '@/pages/Calendar';
import Chat from '@/pages/Chat';
import Notifications from '@/pages/Notifications';
import Analytics from '@/pages/Analytics';
import Forms from '@/pages/Forms';
import FormPreview from '@/pages/FormPreview';
import Feedback from '@/pages/Feedback';
import EmailTemplates from '@/pages/EmailTemplates';
import EmailSequenceDetails from '@/pages/EmailSequenceDetails';
import SmsTemplates from '@/pages/SmsTemplates';
import Documents from '@/pages/Documents';
import Payments from '@/pages/Payments';
import VehicleInspectionForm from '@/pages/VehicleInspectionForm';
import CustomerServiceHistory from '@/pages/CustomerServiceHistory';
import CustomerVehicleDetails from '@/pages/CustomerVehicleDetails';
import ClientBooking from '@/pages/ClientBooking';
import ManufacturerPage from '@/pages/ManufacturerPage';
import AffiliateTool from '@/pages/AffiliateTool';
import DeveloperPortal from '@/pages/DeveloperPortal';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

// Settings pages
import CompanySettings from '@/pages/settings/CompanySettings';
import AccountSettings from '@/pages/settings/AccountSettings';
import BrandingSettings from '@/pages/settings/BrandingSettings';
import AppearanceSettings from '@/pages/settings/AppearanceSettings';
import LanguageSettings from '@/pages/settings/LanguageSettings';
import NotificationSettings from '@/pages/settings/NotificationSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import SecurityAdvancedSettings from '@/pages/settings/SecurityAdvancedSettings';
import IntegrationSettings from '@/pages/settings/IntegrationSettings';
import EmailSettings from '@/pages/settings/EmailSettings';
import EmailSchedulingSettings from '@/pages/settings/EmailSchedulingSettings';
import InventorySettings from '@/pages/settings/InventorySettings';
import MarkupSettings from '@/pages/settings/MarkupSettings';
import LabourSettings from '@/pages/settings/LabourSettings';
import LoyaltySettings from '@/pages/settings/LoyaltySettings';
import DataExportSettings from '@/pages/settings/DataExportSettings';
import TeamHistorySettings from '@/pages/settings/TeamHistorySettings';

// Feedback pages  
import FeedbackFormsPage from '@/pages/feedback/FeedbackFormsPage';
import FeedbackFormEditorPage from '@/pages/feedback/FeedbackFormEditorPage';
import FeedbackAnalyticsPage from '@/pages/feedback/FeedbackAnalyticsPage';

// Developer pages
import ServiceManagement from '@/pages/developer/ServiceManagement';
import OrganizationManagement from '@/pages/developer/OrganizationManagement';

import Layout from '@/components/layout/Layout';
import { AuthGate } from '@/components/AuthGate';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/client-booking" element={<ClientBooking />} />
            <Route path="/vehicle-inspection/:workOrderId" element={<VehicleInspectionForm />} />
            <Route path="/feedback/:formId" element={<Feedback />} />
            <Route path="/form/:formId" element={<FormPreview />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <AuthGate>
                <Layout>
                  <Dashboard />
                </Layout>
              </AuthGate>
            } />

            {/* Work Orders */}
            <Route path="/work-orders" element={
              <AuthGate>
                <Layout>
                  <WorkOrdersPage />
                </Layout>
              </AuthGate>
            } />
            <Route path="/work-orders/create" element={
              <AuthGate>
                <Layout>
                  <WorkOrderCreate />
                </Layout>
              </AuthGate>
            } />
            <Route path="/work-orders/:id" element={
              <AuthGate>
                <Layout>
                  <WorkOrderDetails />
                </Layout>
              </AuthGate>
            } />
            <Route path="/work-orders/:id/edit" element={
              <AuthGate>
                <Layout>
                  <WorkOrderEdit />
                </Layout>
              </AuthGate>
            } />

            {/* Customers */}
            <Route path="/customers" element={
              <AuthGate>
                <Layout>
                  <CustomersPage />
                </Layout>
              </AuthGate>
            } />
            <Route path="/customers/create" element={
              <AuthGate>
                <Layout>
                  <CreateCustomer />
                </Layout>
              </AuthGate>
            } />
            <Route path="/customers/:id" element={
              <AuthGate>
                <Layout>
                  <CustomerDetails />
                </Layout>
              </AuthGate>
            } />
            <Route path="/customers/:id/edit" element={
              <AuthGate>
                <Layout>
                  <CustomerEdit />
                </Layout>
              </AuthGate>
            } />
            <Route path="/edit-customer/:id" element={
              <AuthGate>
                <Layout>
                  <EditCustomer />
                </Layout>
              </AuthGate>
            } />
            <Route path="/customers/:customerId/vehicles/:vehicleId" element={
              <AuthGate>
                <Layout>
                  <CustomerVehicleDetails />
                </Layout>
              </AuthGate>
            } />
            <Route path="/customers/:id/service-history" element={
              <AuthGate>
                <Layout>
                  <CustomerServiceHistory />
                </Layout>
              </AuthGate>
            } />

            {/* Inventory */}
            <Route path="/inventory" element={
              <AuthGate>
                <Layout>
                  <Inventory />
                </Layout>
              </AuthGate>
            } />
            <Route path="/inventory/add" element={
              <AuthGate>
                <Layout>
                  <InventoryAdd />
                </Layout>
              </AuthGate>
            } />
            <Route path="/inventory/stock" element={
              <AuthGate>
                <Layout>
                  <InventoryStock />
                </Layout>
              </AuthGate>
            } />
            <Route path="/inventory/categories" element={
              <AuthGate>
                <Layout>
                  <InventoryCategories />
                </Layout>
              </AuthGate>
            } />
            <Route path="/inventory/locations" element={
              <AuthGate>
                <Layout>
                  <InventoryLocations />
                </Layout>
              </AuthGate>
            } />
            <Route path="/inventory/orders" element={
              <AuthGate>
                <Layout>
                  <InventoryOrders />
                </Layout>
              </AuthGate>
            } />
            <Route path="/inventory/suppliers" element={
              <AuthGate>
                <Layout>
                  <InventorySuppliers />
                </Layout>
              </AuthGate>
            } />
            <Route path="/inventory/manager" element={
              <AuthGate>
                <Layout>
                  <InventoryManager />
                </Layout>
              </AuthGate>
            } />

            {/* Equipment */}
            <Route path="/equipment" element={
              <AuthGate>
                <Layout>
                  <Equipment />
                </Layout>
              </AuthGate>
            } />
            <Route path="/equipment/:id" element={
              <AuthGate>
                <Layout>
                  <EquipmentDetails />
                </Layout>
              </AuthGate>
            } />
            <Route path="/maintenance" element={
              <AuthGate>
                <Layout>
                  <MaintenanceDashboard />
                </Layout>
              </AuthGate>
            } />

            {/* Team */}
            <Route path="/team" element={
              <AuthGate>
                <Layout>
                  <Team />
                </Layout>
              </AuthGate>
            } />
            <Route path="/team/create" element={
              <AuthGate>
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <TeamMemberCreate />
                  </Layout>
                </ProtectedRoute>
              </AuthGate>
            } />
            <Route path="/team/:id" element={
              <AuthGate>
                <Layout>
                  <TeamMemberProfile />
                </Layout>
              </AuthGate>
            } />
            <Route path="/team/roles" element={
              <AuthGate>
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <TeamRoles />
                  </Layout>
                </ProtectedRoute>
              </AuthGate>
            } />
            <Route path="/create-team-member" element={
              <AuthGate>
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <CreateTeamMember />
                  </Layout>
                </ProtectedRoute>
              </AuthGate>
            } />

            {/* Reports & Analytics */}
            <Route path="/reports" element={
              <AuthGate>
                <Layout>
                  <Reports />
                </Layout>
              </AuthGate>
            } />
            <Route path="/analytics" element={
              <AuthGate>
                <Layout>
                  <Analytics />
                </Layout>
              </AuthGate>
            } />

            {/* Invoices */}
            <Route path="/invoices" element={
              <AuthGate>
                <Layout>
                  <Invoices />
                </Layout>
              </AuthGate>
            } />
            <Route path="/invoices/create" element={
              <AuthGate>
                <Layout>
                  <InvoiceCreate />
                </Layout>
              </AuthGate>
            } />
            <Route path="/create-invoice" element={
              <AuthGate>
                <Layout>
                  <CreateInvoice />
                </Layout>
              </AuthGate>
            } />
            <Route path="/invoices/:id" element={
              <AuthGate>
                <Layout>
                  <InvoiceDetails />
                </Layout>
              </AuthGate>
            } />
            <Route path="/invoices/:id/edit" element={
              <AuthGate>
                <Layout>
                  <InvoiceEdit />
                </Layout>
              </AuthGate>
            } />

            {/* Repair Plans */}
            <Route path="/repair-plans" element={
              <AuthGate>
                <Layout>
                  <RepairPlans />
                </Layout>
              </AuthGate>
            } />
            <Route path="/repair-plans/create" element={
              <AuthGate>
                <Layout>
                  <CreateRepairPlan />
                </Layout>
              </AuthGate>
            } />
            <Route path="/repair-plans/:id" element={
              <AuthGate>
                <Layout>
                  <RepairPlanDetails />
                </Layout>
              </AuthGate>
            } />

            {/* Service & Follow-ups */}
            <Route path="/service-reminders" element={
              <AuthGate>
                <Layout>
                  <ServiceReminders />
                </Layout>
              </AuthGate>
            } />
            <Route path="/follow-ups" element={
              <AuthGate>
                <Layout>
                  <CustomerFollowUps />
                </Layout>
              </AuthGate>
            } />

            {/* Calendar & Communication */}
            <Route path="/calendar" element={
              <AuthGate>
                <Layout>
                  <Calendar />
                </Layout>
              </AuthGate>
            } />
            <Route path="/chat" element={
              <AuthGate>
                <Layout>
                  <Chat />
                </Layout>
              </AuthGate>
            } />
            <Route path="/notifications" element={
              <AuthGate>
                <Layout>
                  <Notifications />
                </Layout>
              </AuthGate>
            } />

            {/* Forms & Feedback */}
            <Route path="/forms" element={
              <AuthGate>
                <Layout>
                  <Forms />
                </Layout>
              </AuthGate>
            } />
            <Route path="/feedback/forms" element={
              <AuthGate>
                <Layout>
                  <FeedbackFormsPage />
                </Layout>
              </AuthGate>
            } />
            <Route path="/feedback/forms/:id/edit" element={
              <AuthGate>
                <Layout>
                  <FeedbackFormEditorPage />
                </Layout>
              </AuthGate>
            } />
            <Route path="/feedback/forms/:id/analytics" element={
              <AuthGate>
                <Layout>
                  <FeedbackAnalyticsPage />
                </Layout>
              </AuthGate>
            } />

            {/* Email & SMS */}
            <Route path="/email-templates" element={
              <AuthGate>
                <Layout>
                  <EmailTemplates />
                </Layout>
              </AuthGate>
            } />
            <Route path="/email-sequences/:id" element={
              <AuthGate>
                <Layout>
                  <EmailSequenceDetails />
                </Layout>
              </AuthGate>
            } />
            <Route path="/sms-templates" element={
              <AuthGate>
                <Layout>
                  <SmsTemplates />
                </Layout>
              </AuthGate>
            } />

            {/* Documents & Payments */}
            <Route path="/documents" element={
              <AuthGate>
                <Layout>
                  <Documents />
                </Layout>
              </AuthGate>
            } />
            <Route path="/payments" element={
              <AuthGate>
                <Layout>
                  <Payments />
                </Layout>
              </AuthGate>
            } />

            {/* Shopping & Affiliates */}
            <Route path="/manufacturer/:category" element={
              <AuthGate>
                <Layout>
                  <ManufacturerPage />
                </Layout>
              </AuthGate>
            } />
            <Route path="/affiliate-tool" element={
              <AuthGate>
                <Layout>
                  <AffiliateTool />
                </Layout>
              </AuthGate>
            } />

            {/* Developer Portal */}
            <Route path="/developer" element={
              <AuthGate>
                <ProtectedRoute requiredRole="owner">
                  <Layout>
                    <DeveloperPortal />
                  </Layout>
                </ProtectedRoute>
              </AuthGate>
            } />
            <Route path="/developer/services" element={
              <AuthGate>
                <ProtectedRoute requiredRole="owner">
                  <Layout>
                    <ServiceManagement />
                  </Layout>
                </ProtectedRoute>
              </AuthGate>
            } />
            <Route path="/developer/organizations" element={
              <AuthGate>
                <ProtectedRoute requiredRole="owner">
                  <Layout>
                    <OrganizationManagement />
                  </Layout>
                </ProtectedRoute>
              </AuthGate>
            } />

            {/* Settings Routes */}
            <Route path="/settings/company" element={
              <AuthGate>
                <Layout>
                  <CompanySettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/account" element={
              <AuthGate>
                <Layout>
                  <AccountSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/branding" element={
              <AuthGate>
                <Layout>
                  <BrandingSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/appearance" element={
              <AuthGate>
                <Layout>
                  <AppearanceSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/language" element={
              <AuthGate>
                <Layout>
                  <LanguageSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/notifications" element={
              <AuthGate>
                <Layout>
                  <NotificationSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/security" element={
              <AuthGate>
                <Layout>
                  <SecuritySettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/security/advanced" element={
              <AuthGate>
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <SecurityAdvancedSettings />
                  </Layout>
                </ProtectedRoute>
              </AuthGate>
            } />
            <Route path="/settings/integrations" element={
              <AuthGate>
                <Layout>
                  <IntegrationSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/email" element={
              <AuthGate>
                <Layout>
                  <EmailSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/email/scheduling" element={
              <AuthGate>
                <Layout>
                  <EmailSchedulingSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/inventory" element={
              <AuthGate>
                <Layout>
                  <InventorySettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/markup" element={
              <AuthGate>
                <Layout>
                  <MarkupSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/labour" element={
              <AuthGate>
                <Layout>
                  <LabourSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/loyalty" element={
              <AuthGate>
                <Layout>
                  <LoyaltySettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/data-export" element={
              <AuthGate>
                <Layout>
                  <DataExportSettings />
                </Layout>
              </AuthGate>
            } />
            <Route path="/settings/team-history" element={
              <AuthGate>
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <TeamHistorySettings />
                  </Layout>
                </ProtectedRoute>
              </AuthGate>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
