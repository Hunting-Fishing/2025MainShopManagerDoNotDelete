import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import CustomersPageWrapper from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerVehicleDetails from '@/pages/CustomerVehicleDetails';
import WorkOrders from '@/pages/WorkOrders';
import CreateWorkOrder from '@/pages/CreateWorkOrder';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Inventory from '@/pages/Inventory';
import InventoryCreate from '@/pages/InventoryCreate';
import InventoryAdd from '@/pages/InventoryAdd';
import InventoryManager from '@/pages/InventoryManager';
import InventoryCategories from '@/pages/InventoryCategories';
import InventoryLocations from '@/pages/InventoryLocations';
import InventorySuppliers from '@/pages/InventorySuppliers';
import InventoryOrders from '@/pages/InventoryOrders';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import Team from '@/pages/Team';
import TeamCreate from '@/pages/TeamCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import Calendar from '@/pages/Calendar';
import Chat from '@/pages/Chat';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import Reminders from '@/pages/Reminders';
import Quotes from '@/pages/Quotes';
import QuoteDetails from '@/pages/QuoteDetails';
import Payments from '@/pages/Payments';
import Maintenance from '@/pages/Maintenance';
import Analytics from '@/pages/Analytics';
import PartsTracking from '@/pages/PartsTracking';
import Forms from '@/pages/Forms';
import FormPreview from '@/pages/FormPreview';
import Documents from '@/pages/Documents';
import Feedback from '@/pages/Feedback';
import FeedbackAnalytics from '@/pages/FeedbackAnalytics';
import SmsTemplates from '@/pages/SmsTemplates';
import EmailTemplates from '@/pages/EmailTemplates';
import EmailSequenceDetails from '@/pages/EmailSequenceDetails';
import CallLogger from '@/pages/CallLogger';
import Developer from '@/pages/Developer';
import Shopping from '@/pages/Shopping';
import Authentication from '@/pages/Authentication';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import CustomerPortal from '@/pages/CustomerPortal';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthGate } from '@/components/AuthGate';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { OnboardingRedirectGate } from '@/components/onboarding/OnboardingRedirectGate';

function App() {
  return (
    <AuthGate>
      <OnboardingGate>
        <OnboardingRedirectGate>
          <Routes>
            {/* Authentication routes */}
            <Route path="/auth" element={<Authentication />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Customer Portal routes */}
            <Route path="/customer-portal" element={<CustomerPortal />} />
            <Route path="/customer-portal/login" element={<CustomerPortalLogin />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* Customer routes */}
                    <Route path="customers" element={<CustomersPageWrapper />} />
                    <Route path="customers/create" element={<CreateCustomer />} />
                    <Route path="customers/:id" element={<CustomerDetails />} />
                    <Route path="customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                    
                    {/* Work Order routes */}
                    <Route path="work-orders" element={<WorkOrders />} />
                    <Route path="work-orders/create" element={<CreateWorkOrder />} />
                    <Route path="work-orders/:id" element={<WorkOrderDetails />} />
                    
                    {/* Invoice routes */}
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="invoices/create" element={<InvoiceCreate />} />
                    <Route path="invoices/:id" element={<InvoiceDetails />} />
                    <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
                    
                    {/* Inventory routes */}
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="inventory/create" element={<InventoryCreate />} />
                    <Route path="inventory/add" element={<InventoryAdd />} />
                    <Route path="inventory/manager" element={<InventoryManager />} />
                    <Route path="inventory/categories" element={<InventoryCategories />} />
                    <Route path="inventory/locations" element={<InventoryLocations />} />
                    <Route path="inventory/suppliers" element={<InventorySuppliers />} />
                    <Route path="inventory/orders" element={<InventoryOrders />} />
                    
                    {/* Equipment routes */}
                    <Route path="equipment" element={<Equipment />} />
                    <Route path="equipment/:id" element={<EquipmentDetails />} />
                    
                    {/* Team routes */}
                    <Route path="team" element={<Team />} />
                    <Route path="team/create" element={<TeamCreate />} />
                    <Route path="team/:id" element={<TeamMemberProfile />} />
                    <Route path="team/roles" element={<TeamRoles />} />
                    
                    {/* Other routes */}
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings/*" element={<Settings />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="reminders" element={<Reminders />} />
                    <Route path="quotes" element={<Quotes />} />
                    <Route path="quotes/:id" element={<QuoteDetails />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="maintenance" element={<Maintenance />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="parts-tracking" element={<PartsTracking />} />
                    <Route path="forms" element={<Forms />} />
                    <Route path="forms/preview/:id" element={<FormPreview />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="feedback" element={<Feedback />} />
                    <Route path="feedback/analytics/:id" element={<FeedbackAnalytics />} />
                    <Route path="sms-templates" element={<SmsTemplates />} />
                    <Route path="email-templates" element={<EmailTemplates />} />
                    <Route path="email-sequences/:id" element={<EmailSequenceDetails />} />
                    <Route path="call-logger" element={<CallLogger />} />
                    <Route path="developer" element={<Developer />} />
                    <Route path="shopping" element={<Shopping />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Error routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OnboardingRedirectGate>
      </OnboardingGate>
    </AuthGate>
  );
}

export default App;
