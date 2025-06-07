import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Import existing pages
import Dashboard from '@/pages/Dashboard';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import Team from '@/pages/Team';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamRoles from '@/pages/TeamRoles';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Settings from '@/pages/Settings';
import Authentication from '@/pages/Authentication';
import AffiliateTool from '@/pages/AffiliateTool';
import DeveloperPortal from '@/pages/DeveloperPortal';
import CustomerPortal from '@/pages/CustomerPortal';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

// Developer sub-pages
import OrganizationManagement from '@/pages/developer/OrganizationManagement';
import ShoppingControls from '@/pages/developer/ShoppingControls';
import ServiceManagement from '@/pages/developer/ServiceManagement';
import UserManagement from '@/pages/developer/UserManagement';
import SystemSettings from '@/pages/developer/SystemSettings';
import ToolsManagement from '@/pages/developer/ToolsManagement';
import AnalyticsDashboard from '@/pages/developer/AnalyticsDashboard';
import SecuritySettings from '@/pages/developer/SecuritySettings';

// Other pages
import Reminders from '@/pages/Reminders';
import Calendar from '@/pages/Calendar';
import Chat from '@/pages/Chat';
import Notifications from '@/pages/Notifications';
import Analytics from '@/pages/Analytics';
import Forms from '@/pages/Forms';
import EmailTemplates from '@/pages/EmailTemplates';
import SmsTemplates from '@/pages/SmsTemplates';
import Feedback from '@/pages/Feedback';
import FeedbackAnalytics from '@/pages/FeedbackAnalytics';
import Documents from '@/pages/Documents';
import Payments from '@/pages/Payments';
import RepairPlans from '@/pages/RepairPlans';
import CreateRepairPlan from '@/pages/CreateRepairPlan';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Authentication />} />
          <Route path="/login" element={<Authentication />} />
          <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
          <Route path="/customer-portal" element={<CustomerPortal />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes with layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Customer routes */}
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/create" element={<CreateCustomer />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="customers/:id/edit" element={<CustomerEdit />} />
            
            {/* Team routes */}
            <Route path="team" element={<Team />} />
            <Route path="team/create" element={<TeamMemberCreate />} />
            <Route path="team/:id" element={<TeamMemberProfile />} />
            <Route path="team/roles" element={<TeamRoles />} />
            
            {/* Work Order routes */}
            <Route path="work-orders" element={<WorkOrders />} />
            <Route path="work-orders/:id" element={<WorkOrderDetails />} />
            <Route path="work-orders/:id/edit" element={<WorkOrderEdit />} />
            
            {/* Inventory routes */}
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/add" element={<InventoryAdd />} />
            
            {/* Equipment routes */}
            <Route path="equipment" element={<Equipment />} />
            <Route path="equipment/:id" element={<EquipmentDetails />} />
            
            {/* Maintenance */}
            <Route path="maintenance" element={<MaintenanceDashboard />} />
            
            {/* Invoice routes */}
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/create" element={<InvoiceCreate />} />
            <Route path="invoices/:id" element={<InvoiceDetails />} />
            <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
            
            {/* Repair Plans */}
            <Route path="repair-plans" element={<RepairPlans />} />
            <Route path="repair-plans/create" element={<CreateRepairPlan />} />
            
            {/* Other routes */}
            <Route path="reminders" element={<Reminders />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="chat" element={<Chat />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="forms" element={<Forms />} />
            <Route path="email-templates" element={<EmailTemplates />} />
            <Route path="sms-templates" element={<SmsTemplates />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="feedback-analytics" element={<FeedbackAnalytics />} />
            <Route path="documents" element={<Documents />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Affiliate routes */}
            <Route path="affiliate" element={<AffiliateTool />} />
            
            {/* Developer Portal routes - Admin only */}
            <Route path="developer" element={
              <ProtectedRoute requiredRole="admin">
                <DeveloperPortal />
              </ProtectedRoute>
            } />
            <Route path="developer/organization-management" element={
              <ProtectedRoute requiredRole="admin">
                <OrganizationManagement />
              </ProtectedRoute>
            } />
            <Route path="developer/shopping-controls" element={
              <ProtectedRoute requiredRole="admin">
                <ShoppingControls />
              </ProtectedRoute>
            } />
            <Route path="developer/service-management" element={
              <ProtectedRoute requiredRole="admin">
                <ServiceManagement />
              </ProtectedRoute>
            } />
            <Route path="developer/user-management" element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="developer/system-settings" element={
              <ProtectedRoute requiredRole="admin">
                <SystemSettings />
              </ProtectedRoute>
            } />
            <Route path="developer/tools-management" element={
              <ProtectedRoute requiredRole="admin">
                <ToolsManagement />
              </ProtectedRoute>
            } />
            <Route path="developer/analytics-dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="developer/security-settings" element={
              <ProtectedRoute requiredRole="admin">
                <SecuritySettings />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
