import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import AuthGate from '@/components/AuthGate';
import Layout from '@/components/layout/Layout';

// Public pages (no authentication required)
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Authentication from '@/pages/Authentication';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import CustomerPortal from '@/pages/CustomerPortal';
import ClientBooking from '@/pages/ClientBooking';
import FeedbackForm from '@/pages/FeedbackForm';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';

// Protected pages (authentication required)
import Dashboard from '@/pages/Dashboard';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import CustomerVehicleDetails from '@/pages/CustomerVehicleDetails';
import CustomerServiceHistory from '@/pages/CustomerServiceHistory';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import InventoryCategories from '@/pages/InventoryCategories';
import InventoryLocations from '@/pages/InventoryLocations';
import InventoryManager from '@/pages/InventoryManager';
import InventoryOrders from '@/pages/InventoryOrders';
import InventorySuppliers from '@/pages/InventorySuppliers';
import Team from '@/pages/Team';
import TeamManagement from '@/pages/TeamManagement';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import RepairPlans from '@/pages/RepairPlans';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import Forms from '@/pages/Forms';
import FormPreview from '@/pages/FormPreview';
import Documents from '@/pages/Documents';
import VehicleInspectionForm from '@/pages/VehicleInspectionForm';
import EmailTemplates from '@/pages/EmailTemplates';
import EmailSequenceDetails from '@/pages/EmailSequenceDetails';
import Feedback from '@/pages/Feedback';
import FeedbackAnalytics from '@/pages/FeedbackAnalytics';
import Analytics from '@/pages/Analytics';
import Calendar from '@/pages/Calendar';
import Chat from '@/pages/Chat';
import Payments from '@/pages/Payments';
import Notifications from '@/pages/Notifications';
import Reminders from '@/pages/Reminders';
import SmsTemplates from '@/pages/SmsTemplates';
import Settings from '@/pages/Settings';
import ShoppingPortal from '@/pages/ShoppingPortal';
import AffiliateTool from '@/pages/AffiliateTool';
import ManufacturerPage from '@/pages/ManufacturerPage';

// Settings sub-pages
import AccountSettings from '@/pages/settings/AccountSettings';
import AppearanceSettings from '@/pages/settings/AppearanceSettings';
import BrandingSettings from '@/pages/settings/BrandingSettings';
import CompanySettings from '@/pages/settings/CompanySettings';
import DataExportSettings from '@/pages/settings/DataExportSettings';
import EmailSchedulingSettings from '@/pages/settings/EmailSchedulingSettings';
import EmailSettings from '@/pages/settings/EmailSettings';
import IntegrationSettings from '@/pages/settings/IntegrationSettings';
import IntegrationsSettings from '@/pages/settings/IntegrationsSettings';
import InventorySettings from '@/pages/settings/InventorySettings';
import LabourSettings from '@/pages/settings/LabourSettings';
import LanguageSettings from '@/pages/settings/LanguageSettings';
import LoyaltySettings from '@/pages/settings/LoyaltySettings';
import MarkupSettings from '@/pages/settings/MarkupSettings';
import NotificationSettings from '@/pages/settings/NotificationSettings';
import SecurityAdvancedSettings from '@/pages/settings/SecurityAdvancedSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import TeamHistorySettings from '@/pages/settings/TeamHistorySettings';

// Developer pages (admin role required)
import Developer from '@/pages/Developer';
import DeveloperPortal from '@/pages/DeveloperPortal';
import ServiceManagement from '@/pages/developer/ServiceManagement';
import OrganizationManagement from '@/pages/developer/OrganizationManagement';
import ShoppingControls from '@/pages/developer/ShoppingControls';

// Feedback sub-pages
import FeedbackFormsPage from '@/pages/feedback/FeedbackFormsPage';
import FeedbackFormEditorPage from '@/pages/feedback/FeedbackFormEditorPage';
import FeedbackAnalyticsPage from '@/pages/feedback/FeedbackAnalyticsPage';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <ImpersonationProvider>
      <Router>
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
          <Route path="/customer-portal" element={<CustomerPortal />} />
          <Route path="/client-booking" element={<ClientBooking />} />
          <Route path="/feedback-form/:id" element={<FeedbackForm />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes - authentication required */}
          <Route
            path="/*"
            element={
              <AuthGate>
                <Layout>
                  <Routes>
                    {/* Main dashboard */}
                    <Route path="/" element={<Dashboard />} />
                    
                    {/* Customer routes */}
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/create" element={<CreateCustomer />} />
                    <Route path="/customers/:id" element={<CustomerDetails />} />
                    <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                    <Route path="/customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                    <Route path="/customers/:id/service-history" element={<CustomerServiceHistory />} />

                    {/* Work order routes */}
                    <Route path="/work-orders" element={<WorkOrders />} />
                    <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                    <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />

                    {/* Invoice routes */}
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/create" element={<InvoiceCreate />} />
                    <Route path="/invoices/:id" element={<InvoiceDetails />} />
                    <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />

                    {/* Inventory routes */}
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/inventory/add" element={<InventoryAdd />} />
                    <Route path="/inventory/categories" element={<InventoryCategories />} />
                    <Route path="/inventory/locations" element={<InventoryLocations />} />
                    <Route path="/inventory/manager" element={<InventoryManager />} />
                    <Route path="/inventory/orders" element={<InventoryOrders />} />
                    <Route path="/inventory/suppliers" element={<InventorySuppliers />} />

                    {/* Team routes */}
                    <Route path="/team" element={<Team />} />
                    <Route path="/team-management" element={<TeamManagement />} />
                    <Route path="/team/create" element={<TeamMemberCreate />} />
                    <Route path="/team/:id" element={<TeamMemberProfile />} />
                    <Route path="/team/roles" element={<TeamRoles />} />

                    {/* Equipment routes */}
                    <Route path="/equipment" element={<Equipment />} />
                    <Route path="/equipment/:id" element={<EquipmentDetails />} />
                    <Route path="/maintenance" element={<MaintenanceDashboard />} />

                    {/* Repair plan routes */}
                    <Route path="/repair-plans" element={<RepairPlans />} />
                    <Route path="/repair-plans/create" element={<CreateRepairPlan />} />

                    {/* Form routes */}
                    <Route path="/forms" element={<Forms />} />
                    <Route path="/forms/:id/preview" element={<FormPreview />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/vehicle-inspection" element={<VehicleInspectionForm />} />

                    {/* Email routes */}
                    <Route path="/email-templates" element={<EmailTemplates />} />
                    <Route path="/email-sequences/:id" element={<EmailSequenceDetails />} />

                    {/* Feedback routes */}
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/feedback/forms" element={<FeedbackFormsPage />} />
                    <Route path="/feedback/forms/:id/edit" element={<FeedbackFormEditorPage />} />
                    <Route path="/feedback/analytics" element={<FeedbackAnalytics />} />
                    <Route path="/feedback/analytics/:id" element={<FeedbackAnalyticsPage />} />

                    {/* Other main routes */}
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/reminders" element={<Reminders />} />
                    <Route path="/sms-templates" element={<SmsTemplates />} />

                    {/* Settings routes */}
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

                    {/* Shopping and affiliate routes */}
                    <Route path="/shopping" element={<ShoppingPortal />} />
                    <Route path="/affiliate-tools" element={<AffiliateTool />} />
                    <Route path="/manufacturers/:category" element={<ManufacturerPage />} />

                    {/* Developer routes (admin only) */}
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
                      path="/developer/service-management" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ServiceManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/developer/organization" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <OrganizationManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/developer/shopping" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <ShoppingControls />
                        </ProtectedRoute>
                      } 
                    />

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </AuthGate>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </ImpersonationProvider>
  );
}

export default App;
