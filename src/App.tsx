
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layout Components
import Layout from './components/layout/Layout';
import { AuthGate } from './components/AuthGate';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Authentication Pages (Public Routes)
import Authentication from './pages/Authentication';
import CustomerPortalLogin from './pages/CustomerPortalLogin';
import Unauthorized from './pages/Unauthorized';

// Main Application Pages
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import CreateCustomer from './pages/CreateCustomer';
import CustomerDetails from './pages/CustomerDetails';
import CustomerEdit from './pages/CustomerEdit';
import CustomerVehicleDetails from './pages/CustomerVehicleDetails';
import CustomerServiceHistory from './pages/CustomerServiceHistory';

// Work Orders
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetails from './pages/WorkOrderDetails';
import WorkOrderEdit from './pages/WorkOrderEdit';

// Invoices
import Invoices from './pages/Invoices';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceDetails from './pages/InvoiceDetails';
import InvoiceEdit from './pages/InvoiceEdit';

// Inventory
import Inventory from './pages/Inventory';
import InventoryAdd from './pages/InventoryAdd';
import InventoryCategories from './pages/InventoryCategories';
import InventoryLocations from './pages/InventoryLocations';
import InventoryManager from './pages/InventoryManager';
import InventoryOrders from './pages/InventoryOrders';
import InventorySuppliers from './pages/InventorySuppliers';

// Team Management
import Team from './pages/Team';
import TeamManagement from './pages/TeamManagement';
import TeamMemberCreate from './pages/TeamMemberCreate';
import TeamMemberProfile from './pages/TeamMemberProfile';
import TeamRoles from './pages/TeamRoles';

// Equipment
import Equipment from './pages/Equipment';
import EquipmentDetails from './pages/EquipmentDetails';
import MaintenanceDashboard from './pages/MaintenanceDashboard';

// Repair Plans
import RepairPlans from './pages/RepairPlans';
import CreateRepairPlan from './pages/CreateRepairPlan';

// Settings
import Settings from './pages/Settings';

// Forms and Documents
import Forms from './pages/Forms';
import FormPreview from './pages/FormPreview';
import Documents from './pages/Documents';
import VehicleInspectionForm from './pages/VehicleInspectionForm';

// Email and Communication
import EmailTemplates from './pages/EmailTemplates';
import EmailSequenceDetails from './pages/EmailSequenceDetails';
import SmsTemplates from './pages/SmsTemplates';

// Feedback
import Feedback from './pages/Feedback';
import FeedbackForm from './pages/FeedbackForm';
import FeedbackAnalytics from './pages/FeedbackAnalytics';

// Analytics and Reports
import Analytics from './pages/Analytics';

// Calendar and Scheduling
import Calendar from './pages/Calendar';
import Reminders from './pages/Reminders';

// Customer Portal
import CustomerPortal from './pages/CustomerPortal';
import ClientBooking from './pages/ClientBooking';

// Chat
import Chat from './pages/Chat';

// Payments
import Payments from './pages/Payments';

// Notifications
import Notifications from './pages/Notifications';

// Developer Tools
import Developer from './pages/Developer';
import DeveloperPortal from './pages/DeveloperPortal';

// Shopping and Affiliate
import ShoppingPortal from './pages/ShoppingPortal';
import AffiliateTool from './pages/AffiliateTool';
import ManufacturerPage from './pages/ManufacturerPage';

// Settings Pages
import AccountSettings from './pages/settings/AccountSettings';
import AppearanceSettings from './pages/settings/AppearanceSettings';
import BrandingSettings from './pages/settings/BrandingSettings';
import CompanySettings from './pages/settings/CompanySettings';
import DataExportSettings from './pages/settings/DataExportSettings';
import EmailSchedulingSettings from './pages/settings/EmailSchedulingSettings';
import EmailSettings from './pages/settings/EmailSettings';
import IntegrationSettings from './pages/settings/IntegrationSettings';
import IntegrationsSettings from './pages/settings/IntegrationsSettings';
import InventorySettings from './pages/settings/InventorySettings';
import LabourSettings from './pages/settings/LabourSettings';
import LanguageSettings from './pages/settings/LanguageSettings';
import LoyaltySettings from './pages/settings/LoyaltySettings';
import MarkupSettings from './pages/settings/MarkupSettings';
import NotificationSettings from './pages/settings/NotificationSettings';
import SecurityAdvancedSettings from './pages/settings/SecurityAdvancedSettings';
import SecuritySettings from './pages/settings/SecuritySettings';
import TeamHistorySettings from './pages/settings/TeamHistorySettings';

// Feedback Pages
import FeedbackAnalyticsPage from './pages/feedback/FeedbackAnalyticsPage';
import FeedbackFormEditorPage from './pages/feedback/FeedbackFormEditorPage';
import FeedbackFormsPage from './pages/feedback/FeedbackFormsPage';

// Developer Pages
import OrganizationManagement from './pages/developer/OrganizationManagement';
import ServiceManagement from './pages/developer/ServiceManagement';
import ShoppingControls from './pages/developer/ShoppingControls';

// Error and Not Found Pages
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Authentication />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/staff-login" element={<Authentication />} />
          <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Public Customer Portal Routes */}
          <Route path="/customer-portal" element={<CustomerPortal />} />
          <Route path="/client-booking" element={<ClientBooking />} />
          <Route path="/feedback-form/:id" element={<FeedbackForm />} />
          
          {/* Protected Routes - wrapped in AuthGate and Layout */}
          <Route
            path="/*"
            element={
              <AuthGate>
                <Layout>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Customers */}
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/create" element={<CreateCustomer />} />
                    <Route path="/customers/:id" element={<CustomerDetails />} />
                    <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                    <Route path="/customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                    <Route path="/customers/:id/service-history" element={<CustomerServiceHistory />} />

                    {/* Work Orders */}
                    <Route path="/work-orders" element={<WorkOrders />} />
                    <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                    <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />

                    {/* Invoices */}
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/create" element={<InvoiceCreate />} />
                    <Route path="/invoices/:id" element={<InvoiceDetails />} />
                    <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />

                    {/* Inventory */}
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/inventory/add" element={<InventoryAdd />} />
                    <Route path="/inventory/categories" element={<InventoryCategories />} />
                    <Route path="/inventory/locations" element={<InventoryLocations />} />
                    <Route path="/inventory/manager" element={<InventoryManager />} />
                    <Route path="/inventory/orders" element={<InventoryOrders />} />
                    <Route path="/inventory/suppliers" element={<InventorySuppliers />} />

                    {/* Team Management */}
                    <Route path="/team" element={<Team />} />
                    <Route path="/team-management" element={<TeamManagement />} />
                    <Route path="/team/create" element={<TeamMemberCreate />} />
                    <Route path="/team/:id" element={<TeamMemberProfile />} />
                    <Route path="/team/roles" element={<TeamRoles />} />

                    {/* Equipment */}
                    <Route path="/equipment" element={<Equipment />} />
                    <Route path="/equipment/:id" element={<EquipmentDetails />} />
                    <Route path="/maintenance" element={<MaintenanceDashboard />} />

                    {/* Repair Plans */}
                    <Route path="/repair-plans" element={<RepairPlans />} />
                    <Route path="/repair-plans/create" element={<CreateRepairPlan />} />

                    {/* Forms and Documents */}
                    <Route path="/forms" element={<Forms />} />
                    <Route path="/forms/:id/preview" element={<FormPreview />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/vehicle-inspection" element={<VehicleInspectionForm />} />

                    {/* Email and Communication */}
                    <Route path="/email-templates" element={<EmailTemplates />} />
                    <Route path="/email-sequences/:id" element={<EmailSequenceDetails />} />
                    <Route path="/sms-templates" element={<SmsTemplates />} />

                    {/* Feedback */}
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/feedback/analytics/:id" element={<FeedbackAnalytics />} />
                    <Route path="/feedback/forms" element={<FeedbackFormsPage />} />
                    <Route path="/feedback/analytics" element={<FeedbackAnalyticsPage />} />
                    <Route path="/feedback/editor/:id" element={<FeedbackFormEditorPage />} />

                    {/* Analytics */}
                    <Route path="/analytics" element={<Analytics />} />

                    {/* Calendar and Scheduling */}
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/reminders" element={<Reminders />} />

                    {/* Chat */}
                    <Route path="/chat" element={<Chat />} />

                    {/* Payments */}
                    <Route path="/payments" element={<Payments />} />

                    {/* Notifications */}
                    <Route path="/notifications" element={<Notifications />} />

                    {/* Shopping and Affiliate */}
                    <Route path="/shopping" element={<ShoppingPortal />} />
                    <Route path="/affiliate-tools" element={<AffiliateTool />} />
                    <Route path="/manufacturers/:category" element={<ManufacturerPage />} />

                    {/* Settings Routes */}
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/account" element={<AccountSettings />} />
                    <Route path="/settings/appearance" element={<AppearanceSettings />} />
                    <Route path="/settings/branding" element={<BrandingSettings />} />
                    <Route path="/settings/company" element={<CompanySettings />} />
                    <Route path="/settings/data-export" element={<DataExportSettings />} />
                    <Route path="/settings/email-scheduling" element={<EmailSchedulingSettings />} />
                    <Route path="/settings/email" element={<EmailSettings />} />
                    <Route path="/settings/integration" element={<IntegrationSettings />} />
                    <Route path="/settings/integrations" element={<IntegrationsSettings />} />
                    <Route path="/settings/inventory" element={<InventorySettings />} />
                    <Route path="/settings/labour" element={<LabourSettings />} />
                    <Route path="/settings/language" element={<LanguageSettings />} />
                    <Route path="/settings/loyalty" element={<LoyaltySettings />} />
                    <Route path="/settings/markup" element={<MarkupSettings />} />
                    <Route path="/settings/notifications" element={<NotificationSettings />} />
                    <Route path="/settings/security-advanced" element={<SecurityAdvancedSettings />} />
                    <Route path="/settings/security" element={<SecuritySettings />} />
                    <Route path="/settings/team-history" element={<TeamHistorySettings />} />

                    {/* Developer Routes - Protected with admin role */}
                    <Route 
                      path="/developer" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <Developer />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/developer-portal" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <DeveloperPortal />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/developer/organization-management" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <OrganizationManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/developer/service-management" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ServiceManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/developer/shopping-controls" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ShoppingControls />
                        </ProtectedRoute>
                      } 
                    />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </AuthGate>
            }
          />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
