import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';

// Lazy load components
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const WorkOrders = React.lazy(() => import('@/pages/WorkOrders'));
const WorkOrderDetails = React.lazy(() => import('@/pages/WorkOrderDetails'));
const WorkOrderCreate = React.lazy(() => import('@/pages/WorkOrderCreate'));
const WorkOrderEdit = React.lazy(() => import('@/pages/WorkOrderEdit'));
const Customers = React.lazy(() => import('@/pages/Customers'));
const CustomerDetails = React.lazy(() => import('@/pages/CustomerDetails'));
const CustomerCreate = React.lazy(() => import('@/pages/CustomerCreate'));
const CustomerEdit = React.lazy(() => import('@/pages/CustomerEdit'));
const Inventory = React.lazy(() => import('@/pages/Inventory'));
const InventoryAdd = React.lazy(() => import('@/pages/InventoryAdd'));
const InventoryCreate = React.lazy(() => import('@/pages/InventoryCreate'));
const InventoryManager = React.lazy(() => import('@/pages/InventoryManager'));
const InventoryOrders = React.lazy(() => import('@/pages/InventoryOrders'));
const InventoryLocations = React.lazy(() => import('@/pages/InventoryLocations'));
const InventorySuppliers = React.lazy(() => import('@/pages/InventorySuppliers'));
const InventoryCategories = React.lazy(() => import('@/pages/InventoryCategories'));
const Invoices = React.lazy(() => import('@/pages/Invoices'));
const InvoiceDetails = React.lazy(() => import('@/pages/InvoiceDetails'));
const InvoiceCreate = React.lazy(() => import('@/pages/InvoiceCreate'));
const InvoiceEdit = React.lazy(() => import('@/pages/InvoiceEdit'));
const Calendar = React.lazy(() => import('@/pages/Calendar'));
const Equipment = React.lazy(() => import('@/pages/Equipment'));
const EquipmentDetails = React.lazy(() => import('@/pages/EquipmentDetails'));
const Maintenance = React.lazy(() => import('@/pages/Maintenance'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const Team = React.lazy(() => import('@/pages/Team'));
const TeamMemberProfile = React.lazy(() => import('@/pages/TeamMemberProfile'));
const TeamCreate = React.lazy(() => import('@/pages/TeamCreate'));
const TeamMemberCreate = React.lazy(() => import('@/pages/TeamMemberCreate'));
const TeamRoles = React.lazy(() => import('@/pages/TeamRoles'));
const Notifications = React.lazy(() => import('@/pages/Notifications'));
const Forms = React.lazy(() => import('@/pages/Forms'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const Feedback = React.lazy(() => import('@/pages/Feedback'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Quotes = React.lazy(() => import('@/pages/Quotes'));
const QuoteDetails = React.lazy(() => import('@/pages/QuoteDetails'));
const Documents = React.lazy(() => import('@/pages/Documents'));
const Payments = React.lazy(() => import('@/pages/Payments'));
const Reminders = React.lazy(() => import('@/pages/Reminders'));
const SmsTemplates = React.lazy(() => import('@/pages/SmsTemplates'));
const DeveloperPortal = React.lazy(() => import('@/pages/DeveloperPortal'));
const ClientBooking = React.lazy(() => import('@/pages/ClientBooking'));
const FeedbackForm = React.lazy(() => import('@/pages/FeedbackForm'));
const FeedbackAnalytics = React.lazy(() => import('@/pages/FeedbackAnalytics'));
const TeamManagement = React.lazy(() => import('@/pages/TeamManagement'));
const EmailSequenceDetails = React.lazy(() => import('@/pages/EmailSequenceDetails'));
const CreateRepairPlan = React.lazy(() => import('@/pages/CreateRepairPlan'));
const CustomerVehicleDetails = React.lazy(() => import('@/pages/CustomerVehicleDetails'));
const CreateCustomer = React.lazy(() => import('@/pages/CreateCustomer'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Unauthorized = React.lazy(() => import('@/pages/Unauthorized'));
const Login = React.lazy(() => import('@/pages/Login'));
const Authentication = React.lazy(() => import('@/pages/Authentication'));
const CustomerPortalLogin = React.lazy(() => import('@/pages/CustomerPortalLogin'));
const Signup = React.lazy(() => import('@/pages/Signup'));

function App() {
  return (
    <>
      <Helmet>
        <title>AutoShop Pro - Shop Management System</title>
        <meta name="description" content="Complete automotive shop management solution" />
      </Helmet>
      
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/customer-portal" element={<CustomerPortalLogin />} />
          <Route path="/client-booking" element={<ClientBooking />} />
          <Route path="/feedback-form/:id" element={<FeedbackForm />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Work Orders */}
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/work-orders/create" element={<WorkOrderCreate />} />
              <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
              <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />

              {/* Customers */}
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/create" element={<CustomerCreate />} />
              <Route path="/customers/new" element={<CreateCustomer />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/customers/:id/edit" element={<CustomerEdit />} />
              <Route path="/customers/:id/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />

              {/* Inventory */}
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/add" element={<InventoryAdd />} />
              <Route path="/inventory/create" element={<InventoryCreate />} />
              <Route path="/inventory/manager" element={<InventoryManager />} />
              <Route path="/inventory/orders" element={<InventoryOrders />} />
              <Route path="/inventory/locations" element={<InventoryLocations />} />
              <Route path="/inventory/suppliers" element={<InventorySuppliers />} />
              <Route path="/inventory/categories" element={<InventoryCategories />} />

              {/* Invoices */}
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/create" element={<InvoiceCreate />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />

              {/* Other Routes */}
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/equipment/:id" element={<EquipmentDetails />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/quotes/:id" element={<QuoteDetails />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/sms-templates" element={<SmsTemplates />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />

              {/* Team Routes */}
              <Route path="/team" element={<Team />} />
              <Route path="/team/create" element={<TeamCreate />} />
              <Route path="/team/member/create" element={<TeamMemberCreate />} />
              <Route path="/team/:id" element={<TeamMemberProfile />} />
              <Route path="/team-management" element={<TeamManagement />} />
              <Route path="/team-roles" element={<TeamRoles />} />

              {/* Settings */}
              <Route path="/settings/*" element={<Settings />} />

              {/* Email Sequences */}
              <Route path="/email-sequences/:id" element={<EmailSequenceDetails />} />

              {/* Repair Plans */}
              <Route path="/repair-plans/create" element={<CreateRepairPlan />} />

              {/* Developer Portal - Admin Only */}
              <Route element={<RoleGuard allowedRoles={['admin', 'owner']} />}>
                <Route path="/developer/*" element={<DeveloperPortal />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
