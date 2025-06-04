
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationsProvider } from '@/context/notifications';
import Layout from '@/components/layout/Layout';

// Pages
import Dashboard from '@/pages/Dashboard';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import CustomersPage from '@/pages/CustomersPage';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerVehicleDetails from '@/pages/CustomerVehicleDetails';
import CustomerServiceHistory from '@/pages/CustomerServiceHistory';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import InventoryCategories from '@/pages/InventoryCategories';
import InventoryLocations from '@/pages/InventoryLocations';
import InventorySuppliers from '@/pages/InventorySuppliers';
import InventoryOrders from '@/pages/InventoryOrders';
import InventoryManager from '@/pages/InventoryManager';
import Team from '@/pages/Team';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import TeamManagement from '@/pages/TeamManagement';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Calendar from '@/pages/Calendar';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import Forms from '@/pages/Forms';
import FormPreview from '@/pages/FormPreview';
import Documents from '@/pages/Documents';
import Reminders from '@/pages/Reminders';
import RepairPlans from '@/pages/RepairPlans';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import CustomerPortal from '@/pages/CustomerPortal';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import ClientBooking from '@/pages/ClientBooking';
import ShoppingPortal from '@/pages/ShoppingPortal';
import AffiliateTool from '@/pages/AffiliateTool';
import ManufacturerPage from '@/pages/ManufacturerPage';
import Authentication from '@/pages/Authentication';
import Chat from '@/pages/Chat';
import Payments from '@/pages/Payments';
import EmailTemplates from '@/pages/EmailTemplates';
import EmailSequenceDetails from '@/pages/EmailSequenceDetails';
import SmsTemplates from '@/pages/SmsTemplates';
import VehicleInspectionForm from '@/pages/VehicleInspectionForm';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import Developer from '@/pages/Developer';
import DeveloperPortal from '@/pages/DeveloperPortal';
import Notifications from '@/pages/Notifications';
import Feedback from '@/pages/Feedback';
import FeedbackForm from '@/pages/FeedbackForm';
import FeedbackAnalytics from '@/pages/FeedbackAnalytics';

// Settings pages
import CompanySettings from '@/pages/settings/CompanySettings';
import AccountSettings from '@/pages/settings/AccountSettings';
import AppearanceSettings from '@/pages/settings/AppearanceSettings';
import BrandingSettings from '@/pages/settings/BrandingSettings';
import DataExportSettings from '@/pages/settings/DataExportSettings';

// Developer pages
import OrganizationManagement from '@/pages/developer/OrganizationManagement';
import ShoppingControls from '@/pages/developer/ShoppingControls';

// Feedback pages with default imports
import FeedbackAnalyticsPage from '@/pages/feedback/FeedbackAnalyticsPage';
import FeedbackFormsPage from '@/pages/feedback/FeedbackFormsPage';
import FeedbackFormEditorPage from '@/pages/feedback/FeedbackFormEditorPage';

// Debug pages
import ServiceDataDebugPage from '@/pages/ServiceDataDebug';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationsProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="work-orders" element={<WorkOrders />} />
                  <Route path="work-orders/:id" element={<WorkOrderDetails />} />
                  <Route path="work-orders/:id/edit" element={<WorkOrderEdit />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="customers/create" element={<CreateCustomer />} />
                  <Route path="customers/:id" element={<CustomerDetails />} />
                  <Route path="customers/:id/edit" element={<CustomerEdit />} />
                  <Route path="customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                  <Route path="customers/:customerId/service-history" element={<CustomerServiceHistory />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="inventory/add" element={<InventoryAdd />} />
                  <Route path="inventory/categories" element={<InventoryCategories />} />
                  <Route path="inventory/locations" element={<InventoryLocations />} />
                  <Route path="inventory/suppliers" element={<InventorySuppliers />} />
                  <Route path="inventory/orders" element={<InventoryOrders />} />
                  <Route path="inventory/manager" element={<InventoryManager />} />
                  <Route path="team" element={<Team />} />
                  <Route path="team/create" element={<TeamMemberCreate />} />
                  <Route path="team/:id" element={<TeamMemberProfile />} />
                  <Route path="team/roles" element={<TeamRoles />} />
                  <Route path="team/management" element={<TeamManagement />} />
                  <Route path="equipment" element={<Equipment />} />
                  <Route path="equipment/:id" element={<EquipmentDetails />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="invoices/create" element={<InvoiceCreate />} />
                  <Route path="invoices/:id" element={<InvoiceDetails />} />
                  <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="settings/company" element={<CompanySettings />} />
                  <Route path="settings/account" element={<AccountSettings />} />
                  <Route path="settings/appearance" element={<AppearanceSettings />} />
                  <Route path="settings/branding" element={<BrandingSettings />} />
                  <Route path="settings/data-export" element={<DataExportSettings />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="forms" element={<Forms />} />
                  <Route path="forms/:id/preview" element={<FormPreview />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="reminders" element={<Reminders />} />
                  <Route path="repair-plans" element={<RepairPlans />} />
                  <Route path="repair-plans/create" element={<CreateRepairPlan />} />
                  <Route path="maintenance" element={<MaintenanceDashboard />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="email-templates" element={<EmailTemplates />} />
                  <Route path="email-sequences/:id" element={<EmailSequenceDetails />} />
                  <Route path="sms-templates" element={<SmsTemplates />} />
                  <Route path="vehicle-inspection" element={<VehicleInspectionForm />} />
                  <Route path="developer" element={<Developer />} />
                  <Route path="developer/portal" element={<DeveloperPortal />} />
                  <Route path="developer/organization" element={<OrganizationManagement />} />
                  <Route path="developer/shopping" element={<ShoppingControls />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="feedback" element={<Feedback />} />
                  <Route path="feedback/form" element={<FeedbackForm />} />
                  <Route path="feedback/analytics" element={<FeedbackAnalytics />} />
                  <Route path="feedback/forms" element={<FeedbackFormsPage />} />
                  <Route path="feedback/analytics-detailed" element={<FeedbackAnalyticsPage />} />
                  <Route path="feedback/editor" element={<FeedbackFormEditorPage />} />
                  <Route path="service-data-debug" element={<ServiceDataDebugPage />} />
                  <Route path="unauthorized" element={<Unauthorized />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                
                {/* Public routes without layout */}
                <Route path="/customer-portal" element={<CustomerPortal />} />
                <Route path="/customer-portal/login" element={<CustomerPortalLogin />} />
                <Route path="/booking" element={<ClientBooking />} />
                <Route path="/shopping" element={<ShoppingPortal />} />
                <Route path="/affiliate/:category" element={<AffiliateTool />} />
                <Route path="/manufacturer/:id" element={<ManufacturerPage />} />
                <Route path="/auth" element={<Authentication />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </NotificationsProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
