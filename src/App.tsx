import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { CustomerDataProvider } from '@/contexts/CustomerDataProvider';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';

// Import pages
import Dashboard from '@/pages/Dashboard';
import DeveloperPortal from '@/pages/DeveloperPortal';
import OrganizationManagement from '@/pages/developer/OrganizationManagement';
import ShoppingControls from '@/pages/developer/ShoppingControls';
import ServiceManagement from '@/pages/developer/ServiceManagement';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Authentication from '@/pages/Authentication';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';

// Import other existing pages
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import CustomerVehicleDetails from '@/pages/CustomerVehicleDetails';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import InventoryCategories from '@/pages/InventoryCategories';
import InventoryLocations from '@/pages/InventoryLocations';
import InventorySuppliers from '@/pages/InventorySuppliers';
import InventoryOrders from '@/pages/InventoryOrders';
import InventoryManager from '@/pages/InventoryManager';
import Team from '@/pages/Team';
import TeamManagement from '@/pages/TeamManagement';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import Settings from '@/pages/Settings';
import CustomerPortal from '@/pages/CustomerPortal';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import Calendar from '@/pages/Calendar';
import Analytics from '@/pages/Analytics';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import RepairPlans from '@/pages/RepairPlans';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import VehicleInspectionForm from '@/pages/VehicleInspectionForm';
import Reminders from '@/pages/Reminders';
import Notifications from '@/pages/Notifications';
import Forms from '@/pages/Forms';
import FormPreview from '@/pages/FormPreview';
import Documents from '@/pages/Documents';
import Chat from '@/pages/Chat';
import Feedback from '@/pages/Feedback';
import FeedbackAnalytics from '@/pages/FeedbackAnalytics';
import FeedbackForm from '@/pages/FeedbackForm';
import EmailTemplates from '@/pages/EmailTemplates';
import EmailSequenceDetails from '@/pages/EmailSequenceDetails';
import SmsTemplates from '@/pages/SmsTemplates';
import Payments from '@/pages/Payments';
import ShoppingPortal from '@/pages/ShoppingPortal';
import AffiliateTool from '@/pages/AffiliateTool';
import ManufacturerPage from '@/pages/ManufacturerPage';
import ClientBooking from '@/pages/ClientBooking';
import CustomerServiceHistory from '@/pages/CustomerServiceHistory';

// Add missing developer page imports
import UserManagement from '@/pages/developer/UserManagement';
import SystemSettings from '@/pages/developer/SystemSettings';
import ToolsManagement from '@/pages/developer/ToolsManagement';
import AnalyticsDashboard from '@/pages/developer/AnalyticsDashboard';
import SecuritySettings from '@/pages/developer/SecuritySettings';

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationsProvider>
            <CustomerDataProvider>
              <ImpersonationProvider>
                <Router>
                  <Routes>
                    {/* Auth routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/auth" element={<Authentication />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* Customer Portal routes */}
                    <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
                    <Route path="/customer-portal" element={<CustomerPortal />} />
                    <Route path="/booking/:shopId" element={<ClientBooking />} />
                    
                    {/* Public routes */}
                    <Route path="/shopping" element={<ShoppingPortal />} />
                    <Route path="/affiliate/:category" element={<AffiliateTool />} />
                    <Route path="/manufacturer/:manufacturer" element={<ManufacturerPage />} />
                    <Route path="/feedback-form/:formId" element={<FeedbackForm />} />
                    <Route path="/form/:templateId" element={<FormPreview />} />
                    <Route path="/vehicle-inspection/:workOrderId" element={<VehicleInspectionForm />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Developer Portal routes - Admin/Owner only */}
                    <Route path="/developer" element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <DeveloperPortal />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/developer/organization-management" element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <OrganizationManagement />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/developer/shopping-controls" element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <ShoppingControls />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/developer/service-management" element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <ServiceManagement />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/developer/user-management" element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <UserManagement />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/developer/system-settings" element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <SystemSettings />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/developer/tools-management" element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <ToolsManagement />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/developer/analytics-dashboard" element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <AnalyticsDashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/developer/security-settings" element={
                      <ProtectedRoute requiredRole="admin">
                        <Layout>
                          <SecuritySettings />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Customer routes */}
                    <Route path="/customers" element={
                      <ProtectedRoute>
                        <Layout>
                          <CustomersPage />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/customers/create" element={
                      <ProtectedRoute>
                        <Layout>
                          <CreateCustomer />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/customers/:id" element={
                      <ProtectedRoute>
                        <Layout>
                          <CustomerDetails />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/customers/:id/edit" element={
                      <ProtectedRoute>
                        <Layout>
                          <CustomerEdit />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/customers/:customerId/vehicles/:vehicleId" element={
                      <ProtectedRoute>
                        <Layout>
                          <CustomerVehicleDetails />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/customers/:customerId/service-history" element={
                      <ProtectedRoute>
                        <Layout>
                          <CustomerServiceHistory />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Work Order routes */}
                    <Route path="/work-orders" element={
                      <ProtectedRoute>
                        <Layout>
                          <WorkOrders />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/work-orders/:id" element={
                      <ProtectedRoute>
                        <Layout>
                          <WorkOrderDetails />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/work-orders/:id/edit" element={
                      <ProtectedRoute>
                        <Layout>
                          <WorkOrderEdit />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Inventory routes */}
                    <Route path="/inventory" element={
                      <ProtectedRoute>
                        <Layout>
                          <Inventory />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/inventory/add" element={
                      <ProtectedRoute>
                        <Layout>
                          <InventoryAdd />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/inventory/categories" element={
                      <ProtectedRoute>
                        <Layout>
                          <InventoryCategories />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/inventory/locations" element={
                      <ProtectedRoute>
                        <Layout>
                          <InventoryLocations />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/inventory/suppliers" element={
                      <ProtectedRoute>
                        <Layout>
                          <InventorySuppliers />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/inventory/orders" element={
                      <ProtectedRoute>
                        <Layout>
                          <InventoryOrders />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/inventory/manager" element={
                      <ProtectedRoute>
                        <Layout>
                          <InventoryManager />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Team routes */}
                    <Route path="/team" element={
                      <ProtectedRoute>
                        <Layout>
                          <Team />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/team-management" element={
                      <ProtectedRoute>
                        <Layout>
                          <TeamManagement />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/team/create" element={
                      <ProtectedRoute>
                        <Layout>
                          <TeamMemberCreate />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/team/:id" element={
                      <ProtectedRoute>
                        <Layout>
                          <TeamMemberProfile />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/team/roles" element={
                      <ProtectedRoute>
                        <Layout>
                          <TeamRoles />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Other main routes */}
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/calendar" element={
                      <ProtectedRoute>
                        <Layout>
                          <Calendar />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute>
                        <Layout>
                          <Analytics />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/invoices" element={
                      <ProtectedRoute>
                        <Layout>
                          <Invoices />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/invoices/create" element={
                      <ProtectedRoute>
                        <Layout>
                          <InvoiceCreate />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/invoices/:id" element={
                      <ProtectedRoute>
                        <Layout>
                          <InvoiceDetails />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/invoices/:id/edit" element={
                      <ProtectedRoute>
                        <Layout>
                          <InvoiceEdit />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/equipment" element={
                      <ProtectedRoute>
                        <Layout>
                          <Equipment />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/equipment/:id" element={
                      <ProtectedRoute>
                        <Layout>
                          <EquipmentDetails />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/maintenance" element={
                      <ProtectedRoute>
                        <Layout>
                          <MaintenanceDashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/repair-plans" element={
                      <ProtectedRoute>
                        <Layout>
                          <RepairPlans />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/repair-plans/create" element={
                      <ProtectedRoute>
                        <Layout>
                          <CreateRepairPlan />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/reminders" element={
                      <ProtectedRoute>
                        <Layout>
                          <Reminders />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <Layout>
                          <Notifications />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/forms" element={
                      <ProtectedRoute>
                        <Layout>
                          <Forms />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/documents" element={
                      <ProtectedRoute>
                        <Layout>
                          <Documents />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/chat" element={
                      <ProtectedRoute>
                        <Layout>
                          <Chat />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/feedback" element={
                      <ProtectedRoute>
                        <Layout>
                          <Feedback />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/feedback/:formId/analytics" element={
                      <ProtectedRoute>
                        <Layout>
                          <FeedbackAnalytics />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/email-templates" element={
                      <ProtectedRoute>
                        <Layout>
                          <EmailTemplates />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/email-sequences/:id" element={
                      <ProtectedRoute>
                        <Layout>
                          <EmailSequenceDetails />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/sms-templates" element={
                      <ProtectedRoute>
                        <Layout>
                          <SmsTemplates />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/payments" element={
                      <ProtectedRoute>
                        <Layout>
                          <Payments />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Router>
              </ImpersonationProvider>
            </CustomerDataProvider>
          </NotificationsProvider>
        </LanguageProvider>
      </ThemeProvider>
      <Toaster />
      <Sonner />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
