
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetails from './pages/WorkOrderDetails';
import WorkOrderEdit from './pages/WorkOrderEdit';
import Customers from './pages/CustomersPage';
import CustomerDetails from './pages/CustomerDetails';
import CustomerEdit from './pages/CustomerEdit';
import CreateCustomer from './pages/CreateCustomer';
import Inventory from './pages/Inventory';
import InventoryAdd from './pages/InventoryAdd';
import Settings from './pages/Settings';
import Team from './pages/Team';
import TeamMemberProfile from './pages/TeamMemberProfile';
import TeamMemberCreate from './pages/TeamMemberCreate';
import TeamRoles from './pages/TeamRoles';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import Equipment from './pages/Equipment';
import EquipmentDetails from './pages/EquipmentDetails';
import Invoices from './pages/Invoices';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceDetails from './pages/InvoiceDetails';
import InvoiceEdit from './pages/InvoiceEdit';
import Analytics from './pages/Analytics';
import Reminders from './pages/Reminders';
import RepairPlans from './pages/RepairPlans';
import CreateRepairPlan from './pages/CreateRepairPlan';
import MaintenanceDashboard from './pages/MaintenanceDashboard';
import Payments from './pages/Payments';
import SmsTemplates from './pages/SmsTemplates';
import Forms from './pages/Forms';
import FormPreview from './pages/FormPreview';
import Feedback from './pages/Feedback';
import FeedbackForm from './pages/FeedbackForm';
import FeedbackAnalytics from './pages/FeedbackAnalytics';
import Notifications from './pages/Notifications';
import VehicleInspectionForm from './pages/VehicleInspectionForm';
import CustomerVehicleDetails from './pages/CustomerVehicleDetails';
import CustomerServiceHistory from './pages/CustomerServiceHistory';
import Developer from './pages/Developer';
import DeveloperPortal from './pages/DeveloperPortal';
import TeamManagement from './pages/TeamManagement';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Authentication from './pages/Authentication';
import Signup from './pages/Signup';
import CustomerPortal from './pages/CustomerPortal';
import CustomerPortalLogin from './pages/CustomerPortalLogin';
import ClientBooking from './pages/ClientBooking';
import ShoppingPortal from './pages/ShoppingPortal';
import AffiliateTool from './pages/AffiliateTool';
import ManufacturerPage from './pages/ManufacturerPage';
import EmailTemplates from './pages/EmailTemplates';
import EmailSequenceDetails from './pages/EmailSequenceDetails';
import Documents from './pages/Documents';
import InventoryCategories from './pages/InventoryCategories';
import InventoryLocations from './pages/InventoryLocations';
import InventorySuppliers from './pages/InventorySuppliers';
import InventoryOrders from './pages/InventoryOrders';
import InventoryManager from './pages/InventoryManager';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

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
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/customer-portal" element={<CustomerPortal />} />
          <Route path="/customer-portal/login" element={<CustomerPortalLogin />} />
          <Route path="/booking/:shopId" element={<ClientBooking />} />
          <Route path="/shopping" element={<ShoppingPortal />} />
          <Route path="/tools" element={<AffiliateTool />} />
          <Route path="/manufacturers/:category" element={<ManufacturerPage />} />
          <Route path="/feedback/:formId" element={<FeedbackForm />} />
          <Route path="/vehicle-inspection/:workOrderId" element={<VehicleInspectionForm />} />
          <Route path="/form/:templateId" element={<FormPreview />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
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
          
          <Route path="/customers" element={
            <ProtectedRoute>
              <Layout>
                <Customers />
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
          
          <Route path="/settings/*" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/team" element={
            <ProtectedRoute>
              <Layout>
                <Team />
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
          
          <Route path="/team-management" element={
            <ProtectedRoute>
              <Layout>
                <TeamManagement />
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
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <Layout>
                <Chat />
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
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
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
          
          <Route path="/maintenance" element={
            <ProtectedRoute>
              <Layout>
                <MaintenanceDashboard />
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
          
          <Route path="/sms-templates" element={
            <ProtectedRoute>
              <Layout>
                <SmsTemplates />
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
          
          <Route path="/feedback" element={
            <ProtectedRoute>
              <Layout>
                <Feedback />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/feedback/analytics/:formId" element={
            <ProtectedRoute>
              <Layout>
                <FeedbackAnalytics />
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
          
          <Route path="/developer" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <Developer />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/developer/*" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <DeveloperPortal />
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
          
          <Route path="/documents" element={
            <ProtectedRoute>
              <Layout>
                <Documents />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
