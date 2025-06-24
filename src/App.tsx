import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { OnboardingRedirectGate } from '@/components/onboarding/OnboardingRedirectGate';
import { CustomerLoginRequired } from '@/components/customer-portal/CustomerLoginRequired';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Public routes (lazy loaded)
const Authentication = React.lazy(() => import('@/pages/Authentication'));
const Signup = React.lazy(() => import('@/pages/Signup'));
const CustomerPortalLogin = React.lazy(() => import('@/pages/CustomerPortalLogin'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Unauthorized = React.lazy(() => import('@/pages/Unauthorized'));

// Main application routes (lazy loaded)
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Customers = React.lazy(() => import('@/pages/Customers'));
const CreateCustomer = React.lazy(() => import('@/pages/CreateCustomer'));
const CustomerDetails = React.lazy(() => import('@/pages/CustomerDetails'));
const CustomerVehicleDetails = React.lazy(() => import('@/pages/CustomerVehicleDetails'));
const WorkOrders = React.lazy(() => import('@/pages/WorkOrders'));
const WorkOrderCreate = React.lazy(() => import('@/pages/WorkOrderCreate'));
const WorkOrderDetails = React.lazy(() => import('@/pages/WorkOrderDetails'));
const WorkOrderEdit = React.lazy(() => import('@/pages/WorkOrderEdit'));
const Invoices = React.lazy(() => import('@/pages/Invoices'));
const InvoiceCreate = React.lazy(() => import('@/pages/InvoiceCreate'));
const InvoiceDetails = React.lazy(() => import('@/pages/InvoiceDetails'));
const InvoiceEdit = React.lazy(() => import('@/pages/InvoiceEdit'));
const Inventory = React.lazy(() => import('@/pages/Inventory'));
const InventoryAdd = React.lazy(() => import('@/pages/InventoryAdd'));
const InventoryCategories = React.lazy(() => import('@/pages/InventoryCategories'));
const InventoryLocations = React.lazy(() => import('@/pages/InventoryLocations'));
const InventorySuppliers = React.lazy(() => import('@/pages/InventorySuppliers'));
const InventoryOrders = React.lazy(() => import('@/pages/InventoryOrders'));
const Team = React.lazy(() => import('@/pages/Team'));
const TeamCreate = React.lazy(() => import('@/pages/TeamCreate'));
const TeamMemberProfile = React.lazy(() => import('@/pages/TeamMemberProfile'));
const TeamRoles = React.lazy(() => import('@/pages/TeamRoles'));
const Equipment = React.lazy(() => import('@/pages/Equipment'));
const EquipmentDetails = React.lazy(() => import('@/pages/EquipmentDetails'));
const Calendar = React.lazy(() => import('@/pages/Calendar'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Notifications = React.lazy(() => import('@/pages/Notifications'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const Documents = React.lazy(() => import('@/pages/Documents'));
const Quotes = React.lazy(() => import('@/pages/Quotes'));
const QuoteDetails = React.lazy(() => import('@/pages/QuoteDetails'));
const Reminders = React.lazy(() => import('@/pages/Reminders'));
const Payments = React.lazy(() => import('@/pages/Payments'));
const Maintenance = React.lazy(() => import('@/pages/Maintenance'));
const PartsTracking = React.lazy(() => import('@/pages/PartsTracking'));
const Forms = React.lazy(() => import('@/pages/Forms'));
const FormPreview = React.lazy(() => import('@/pages/FormPreview'));
const Feedback = React.lazy(() => import('@/pages/Feedback'));
const FeedbackForm = React.lazy(() => import('@/pages/FeedbackForm'));
const FeedbackAnalytics = React.lazy(() => import('@/pages/FeedbackAnalytics'));
const VehicleInspectionForm = React.lazy(() => import('@/pages/VehicleInspectionForm'));
const SmsTemplates = React.lazy(() => import('@/pages/SmsTemplates'));
const EmailTemplates = React.lazy(() => import('@/pages/EmailTemplates'));
const EmailSequenceDetails = React.lazy(() => import('@/pages/EmailSequenceDetails'));

// Developer routes (lazy loaded)
const Developer = React.lazy(() => import('@/pages/Developer'));
const ServiceManagementPage = React.lazy(() => import('@/pages/developer/ServiceManagementPage'));
const Shopping = React.lazy(() => import('@/pages/Shopping'));

// Customer portal routes (lazy loaded)
const CustomerPortal = React.lazy(() => import('@/pages/CustomerPortal'));
const ClientBooking = React.lazy(() => import('@/pages/ClientBooking'));

// Settings pages (lazy loaded)
const AccountSettings = React.lazy(() => import('@/pages/settings/AccountSettings'));
const CompanySettings = React.lazy(() => import('@/pages/settings/CompanySettings'));
const TeamHistorySettings = React.lazy(() => import('@/pages/settings/TeamHistorySettings'));
const BrandingSettings = React.lazy(() => import('@/pages/settings/BrandingSettings'));
const NotificationSettings = React.lazy(() => import('@/pages/settings/NotificationSettings'));
const SecuritySettings = React.lazy(() => import('@/pages/settings/SecuritySettings'));
const IntegrationSettings = React.lazy(() => import('@/pages/settings/IntegrationSettings'));
const EmailSchedulingSettings = React.lazy(() => import('@/pages/settings/EmailSchedulingSettings'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Authentication />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/customer-portal/login" element={<CustomerPortalLogin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Customer portal routes */}
          <Route path="/customer-portal/*" element={
            <CustomerLoginRequired>
              <Routes>
                <Route path="/" element={<CustomerPortal />} />
                <Route path="/booking" element={<ClientBooking />} />
              </Routes>
            </CustomerLoginRequired>
          } />
          
          {/* Form routes (public) */}
          <Route path="/forms/:formId" element={<FormPreview />} />
          <Route path="/feedback/:formId" element={<FeedbackForm />} />
          <Route path="/inspection/:workOrderId" element={<VehicleInspectionForm />} />
          
          {/* Main application routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <OnboardingRedirectGate>
                <OnboardingGate>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Customer management */}
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/new" element={<CreateCustomer />} />
                      <Route path="/customers/:id" element={<CustomerDetails />} />
                      <Route path="/customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                      
                      {/* Work order management */}
                      <Route path="/work-orders" element={<WorkOrders />} />
                      <Route path="/work-orders/new" element={<WorkOrderCreate />} />
                      <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                      <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />
                      
                      {/* Invoice management */}
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/invoices/new" element={<InvoiceCreate />} />
                      <Route path="/invoices/:id" element={<InvoiceDetails />} />
                      <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                      
                      {/* Inventory management */}
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/inventory/add" element={<InventoryAdd />} />
                      <Route path="/inventory/categories" element={<InventoryCategories />} />
                      <Route path="/inventory/locations" element={<InventoryLocations />} />
                      <Route path="/inventory/suppliers" element={<InventorySuppliers />} />
                      <Route path="/inventory/orders" element={<InventoryOrders />} />
                      
                      {/* Team management */}
                      <Route path="/team" element={<Team />} />
                      <Route path="/team/new" element={<TeamCreate />} />
                      <Route path="/team/:id" element={<TeamMemberProfile />} />
                      <Route path="/team/roles" element={<TeamRoles />} />
                      
                      {/* Equipment management */}
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/equipment/:id" element={<EquipmentDetails />} />
                      
                      {/* Other features */}
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/quotes" element={<Quotes />} />
                      <Route path="/quotes/:id" element={<QuoteDetails />} />
                      <Route path="/reminders" element={<Reminders />} />
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/parts-tracking" element={<PartsTracking />} />
                      <Route path="/forms" element={<Forms />} />
                      <Route path="/feedback" element={<Feedback />} />
                      <Route path="/feedback/:id/analytics" element={<FeedbackAnalytics />} />
                      <Route path="/sms-templates" element={<SmsTemplates />} />
                      <Route path="/email-templates" element={<EmailTemplates />} />
                      <Route path="/email-sequences/:id" element={<EmailSequenceDetails />} />
                      
                      {/* Settings routes */}
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/settings/account" element={<AccountSettings />} />
                      <Route path="/settings/company" element={<CompanySettings />} />
                      <Route path="/settings/team-history" element={<TeamHistorySettings />} />
                      <Route path="/settings/branding" element={<BrandingSettings />} />
                      <Route path="/settings/notifications" element={<NotificationSettings />} />
                      <Route path="/settings/security" element={<SecuritySettings />} />
                      <Route path="/settings/integrations" element={<IntegrationSettings />} />
                      <Route path="/settings/email-scheduling" element={<EmailSchedulingSettings />} />
                      
                      {/* Developer routes */}
                      <Route path="/developer" element={
                        <ProtectedRoute requireOwner>
                          <Developer />
                        </ProtectedRoute>
                      } />
                      <Route path="/developer/service-management/*" element={
                        <ProtectedRoute requireOwner>
                          <ServiceManagementPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/shopping" element={<Shopping />} />
                      
                      {/* Catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </OnboardingGate>
              </OnboardingRedirectGate>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
      <Toaster />
    </div>
  );
}

export default App;
