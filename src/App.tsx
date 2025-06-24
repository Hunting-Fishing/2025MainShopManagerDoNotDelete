import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Customers } from '@/pages/customers/Customers';
import { CustomerCreate } from '@/pages/customers/CustomerCreate';
import { CustomerDetails } from '@/pages/customers/CustomerDetails';
import { CustomerVehicleDetails } from '@/pages/customers/CustomerVehicleDetails';
import { WorkOrders } from '@/pages/work-orders/WorkOrders';
import { CreateWorkOrder } from '@/pages/work-orders/CreateWorkOrder';
import { WorkOrderDetails } from '@/pages/work-orders/WorkOrderDetails';
import { Invoices } from '@/pages/invoices/Invoices';
import { InvoiceCreate } from '@/pages/invoices/InvoiceCreate';
import { InvoiceDetails } from '@/pages/invoices/InvoiceDetails';
import { InvoiceEdit } from '@/pages/invoices/InvoiceEdit';
import { Inventory } from '@/pages/inventory/Inventory';
import { InventoryCreate } from '@/pages/inventory/InventoryCreate';
import { InventoryAdd } from '@/pages/inventory/InventoryAdd';
import { InventoryManager } from '@/pages/inventory/InventoryManager';
import { InventoryCategories } from '@/pages/inventory/InventoryCategories';
import { InventoryLocations } from '@/pages/inventory/InventoryLocations';
import { InventorySuppliers } from '@/pages/inventory/InventorySuppliers';
import { InventoryOrders } from '@/pages/inventory/InventoryOrders';
import { Equipment } from '@/pages/equipment/Equipment';
import { EquipmentDetails } from '@/pages/equipment/EquipmentDetails';
import { Team } from '@/pages/team/Team';
import { TeamCreate } from '@/pages/team/TeamCreate';
import { TeamMemberProfile } from '@/pages/team/TeamMemberProfile';
import { TeamRoles } from '@/pages/team/TeamRoles';
import { Calendar } from '@/pages/Calendar';
import { Chat } from '@/pages/Chat';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/settings/Settings';
import { Notifications } from '@/pages/Notifications';
import { Reminders } from '@/pages/Reminders';
import { Quotes } from '@/pages/quotes/Quotes';
import { QuoteDetails } from '@/pages/quotes/QuoteDetails';
import { Payments } from '@/pages/Payments';
import { Maintenance } from '@/pages/Maintenance';
import { Analytics } from '@/pages/Analytics';
import { PartsTracking } from '@/pages/PartsTracking';
import { Forms } from '@/pages/forms/Forms';
import { FormPreview } from '@/pages/forms/FormPreview';
import { Documents } from '@/pages/Documents';
import { Feedback } from '@/pages/feedback/Feedback';
import { FeedbackAnalytics } from '@/pages/feedback/FeedbackAnalytics';
import { SmsTemplates } from '@/pages/sms-templates/SmsTemplates';
import { EmailTemplates } from '@/pages/email-templates/EmailTemplates';
import { EmailSequenceDetails } from '@/pages/email-templates/EmailSequenceDetails';
import { CallLogger } from '@/pages/CallLogger';
import { Developer } from '@/pages/Developer';
import { Shopping } from '@/pages/Shopping';
import { ManufacturerPage } from '@/pages/manufacturers/ManufacturerPage';
import { AffiliateTool } from '@/pages/tools/AffiliateTool';
import { CustomerPortal } from '@/pages/customer-portal/CustomerPortal';
import { VehicleInspectionForm } from '@/pages/work-orders/VehicleInspectionForm';
import { CreateRepairPlan } from '@/pages/repair-plans/CreateRepairPlan';
import { NotFound } from '@/pages/NotFound';
import { AuthGate } from '@/components/AuthGate';
import { FeedbackForm } from '@/pages/feedback/FeedbackForm';
import { ClientBooking } from '@/pages/ClientBooking';
import Authentication from '@/pages/Authentication';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';

const ServiceManagementPage = lazy(() => import('@/pages/developer/ServiceManagementPage'));

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <AuthGate>
            <Layout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/create" element={<CustomerCreate />} />
                <Route path="customers/:customerId" element={<CustomerDetails />} />
                <Route path="customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                <Route path="work-orders" element={<WorkOrders />} />
                <Route path="work-orders/create" element={<CreateWorkOrder />} />
                <Route path="work-orders/:id" element={<WorkOrderDetails />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/create" element={<InvoiceCreate />} />
                <Route path="invoices/:id" element={<InvoiceDetails />} />
                <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventory/create" element={<InventoryCreate />} />
                <Route path="inventory/add" element={<InventoryAdd />} />
                <Route path="inventory/manager" element={<InventoryManager />} />
                <Route path="inventory/categories" element={<InventoryCategories />} />
                <Route path="inventory/locations" element={<InventoryLocations />} />
                <Route path="inventory/suppliers" element={<InventorySuppliers />} />
                <Route path="inventory/orders" element={<InventoryOrders />} />
                <Route path="equipment" element={<Equipment />} />
                <Route path="equipment/:id" element={<EquipmentDetails />} />
                <Route path="team" element={<Team />} />
                <Route path="team/create" element={<TeamCreate />} />
                <Route path="team/:id" element={<TeamMemberProfile />} />
                <Route path="team/roles" element={<TeamRoles />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="chat" element={<Chat />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
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
                <Route path="feedback/analytics/:formId" element={<FeedbackAnalytics />} />
                <Route path="sms-templates" element={<SmsTemplates />} />
                <Route path="email-templates" element={<EmailTemplates />} />
                <Route path="email-sequences/:id" element={<EmailSequenceDetails />} />
                <Route path="calls" element={<CallLogger />} />
                <Route path="developer" element={<Developer />} />
                <Route path="developer/service-management" element={<Suspense fallback={<div>Loading...</div>}><ServiceManagementPage /></Suspense>} />
                <Route path="shopping" element={<Shopping />} />
                <Route path="manufacturers/:slug" element={<ManufacturerPage />} />
                <Route path="tools/:id" element={<AffiliateTool />} />
                <Route path="customer-portal" element={<CustomerPortal />} />
                <Route path="vehicle-inspection/:workOrderId" element={<VehicleInspectionForm />} />
                <Route path="repair-plans/create" element={<CreateRepairPlan />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </AuthGate>
        } />
        
        {/* Public feedback form route */}
        <Route path="/feedback/:formId" element={<FeedbackForm />} />
        <Route path="/client-booking/:slug?" element={<ClientBooking />} />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
