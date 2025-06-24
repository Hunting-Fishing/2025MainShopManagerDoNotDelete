import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { ServiceErrorBoundary } from '@/components/common/ServiceErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { AuthGate } from '@/components/AuthGate';

// Lazy load components for better performance
const Login = React.lazy(() => import('@/pages/Login'));
const Authentication = React.lazy(() => import('@/pages/Authentication'));
const CustomerPortalLogin = React.lazy(() => import('@/pages/CustomerPortalLogin'));

// Dashboard and main app pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const WorkOrders = React.lazy(() => import('@/pages/WorkOrders'));
const WorkOrderDetails = React.lazy(() => import('@/pages/WorkOrderDetails'));
const CreateWorkOrder = React.lazy(() => import('@/pages/CreateWorkOrder'));
const EditWorkOrder = React.lazy(() => import('@/pages/EditWorkOrder'));
const Customers = React.lazy(() => import('@/pages/Customers'));
const CustomerDetails = React.lazy(() => import('@/pages/CustomerDetails'));
const CreateCustomer = React.lazy(() => import('@/pages/CreateCustomer'));
const VehicleDetails = React.lazy(() => import('@/pages/VehicleDetails'));
const Inventory = React.lazy(() => import('@/pages/Inventory'));
const Invoices = React.lazy(() => import('@/pages/Invoices'));
const InvoiceDetails = React.lazy(() => import('@/pages/InvoiceDetails'));
const CreateInvoice = React.lazy(() => import('@/pages/CreateInvoice'));
const Team = React.lazy(() => import('@/pages/Team'));
const TeamMemberProfile = React.lazy(() => import('@/pages/TeamMemberProfile'));
const CreateTeamMember = React.lazy(() => import('@/pages/CreateTeamMember'));
const TeamRoles = React.lazy(() => import('@/pages/TeamRoles'));
const Calendar = React.lazy(() => import('@/pages/Calendar'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Equipment = React.lazy(() => import('@/pages/Equipment'));
const EquipmentDetails = React.lazy(() => import('@/pages/EquipmentDetails'));
const Maintenance = React.lazy(() => import('@/pages/Maintenance'));
const CallLogger = React.lazy(() => import('@/pages/CallLogger'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const Quotes = React.lazy(() => import('@/pages/Quotes'));
const Reminders = React.lazy(() => import('@/pages/Reminders'));
const Documents = React.lazy(() => import('@/pages/Documents'));
const Feedback = React.lazy(() => import('@/pages/Feedback'));
const AffiliateTool = React.lazy(() => import('@/pages/AffiliateTool'));
const ClientBooking = React.lazy(() => import('@/pages/ClientBooking'));
const Onboarding = React.lazy(() => import('@/pages/Onboarding'));

// Developer pages
const DeveloperDashboard = React.lazy(() => import('@/pages/DeveloperDashboard'));
const ServiceManagement = React.lazy(() => import('@/pages/ServiceManagement'));
const ServiceManagementTree = React.lazy(() => import('@/pages/ServiceManagementTree'));
const ServiceManagementExcel = React.lazy(() => import('@/pages/ServiceManagementExcel'));
const ServiceManagementImport = React.lazy(() => import('@/pages/ServiceManagementImport'));
const ShoppingSite = React.lazy(() => import('@/pages/ShoppingSite'));

// Customer Portal pages
const CustomerPortal = React.lazy(() => import('@/pages/CustomerPortal'));
const CustomerPortalBooking = React.lazy(() => import('@/pages/CustomerPortalBooking'));
const CustomerPortalWorkOrders = React.lazy(() => import('@/pages/CustomerPortalWorkOrders'));
const CustomerPortalVehicles = React.lazy(() => import('@/pages/CustomerPortalVehicles'));
const CustomerPortalInvoices = React.lazy(() => import('@/pages/CustomerPortalInvoices'));
const CustomerPortalProfile = React.lazy(() => import('@/pages/CustomerPortalProfile'));

// Shared loading component
const PageLoader = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" message={message} />
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <AuthGate>
    <Layout>
      {children}
    </Layout>
  </AuthGate>
);

function App() {
  return (
    <div className="min-h-screen bg-background">
      <ServiceErrorBoundary>
        <Suspense fallback={<PageLoader message="Loading application..." />}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/auth/login" 
              element={
                <AuthErrorBoundary>
                  <Login />
                </AuthErrorBoundary>
              } 
            />
            <Route 
              path="/login" 
              element={
                <AuthErrorBoundary>
                  <Login />
                </AuthErrorBoundary>
              } 
            />
            
            {/* Customer Portal Public Routes */}
            <Route 
              path="/customer-portal" 
              element={
                <AuthErrorBoundary>
                  <CustomerPortalLogin />
                </AuthErrorBoundary>
              } 
            />
            <Route 
              path="/customer-portal/login" 
              element={
                <AuthErrorBoundary>
                  <CustomerPortalLogin />
                </AuthErrorBoundary>
              } 
            />
            
            {/* Auth redirect handler */}
            <Route 
              path="/auth" 
              element={
                <Suspense fallback={<PageLoader message="Authenticating..." />}>
                  <Authentication />
                </Suspense>
              } 
            />
            
            {/* Client booking (public) */}
            <Route 
              path="/booking/:shopId" 
              element={
                <Suspense fallback={<PageLoader message="Loading booking..." />}>
                  <ClientBooking />
                </Suspense>
              } 
            />
            
            {/* Protected Customer Portal Routes */}
            <Route 
              path="/customer-portal/dashboard" 
              element={
                <Suspense fallback={<PageLoader message="Loading customer portal..." />}>
                  <CustomerPortal />
                </Suspense>
              } 
            />
            <Route 
              path="/customer-portal/booking" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <CustomerPortalBooking />
                </Suspense>
              } 
            />
            <Route 
              path="/customer-portal/work-orders" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <CustomerPortalWorkOrders />
                </Suspense>
              } 
            />
            <Route 
              path="/customer-portal/vehicles" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <CustomerPortalVehicles />
                </Suspense>
              } 
            />
            <Route 
              path="/customer-portal/invoices" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <CustomerPortalInvoices />
                </Suspense>
              } 
            />
            <Route 
              path="/customer-portal/profile" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <CustomerPortalProfile />
                </Suspense>
              } 
            />
            
            {/* Onboarding (protected) */}
            <Route 
              path="/onboarding" 
              element={
                <Suspense fallback={<PageLoader message="Loading onboarding..." />}>
                  <Onboarding />
                </Suspense>
              } 
            />
            
            {/* Main Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Work Orders */}
            <Route 
              path="/work-orders" 
              element={
                <ProtectedRoute>
                  <WorkOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/work-orders/create" 
              element={
                <ProtectedRoute>
                  <CreateWorkOrder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/work-orders/:id" 
              element={
                <ProtectedRoute>
                  <WorkOrderDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/work-orders/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditWorkOrder />
                </ProtectedRoute>
              } 
            />
            
            {/* Customers */}
            <Route 
              path="/customers" 
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customers/create" 
              element={
                <ProtectedRoute>
                  <CreateCustomer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customers/:id" 
              element={
                <ProtectedRoute>
                  <CustomerDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customers/:customerId/vehicles/:vehicleId" 
              element={
                <ProtectedRoute>
                  <VehicleDetails />
                </ProtectedRoute>
              } 
            />
            
            {/* Inventory */}
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } 
            />
            
            {/* Invoices */}
            <Route 
              path="/invoices" 
              element={
                <ProtectedRoute>
                  <Invoices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices/create" 
              element={
                <ProtectedRoute>
                  <CreateInvoice />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices/:id" 
              element={
                <ProtectedRoute>
                  <InvoiceDetails />
                </ProtectedRoute>
              } 
            />
            
            {/* Team Management */}
            <Route 
              path="/team" 
              element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team/create" 
              element={
                <ProtectedRoute>
                  <CreateTeamMember />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team/:id" 
              element={
                <ProtectedRoute>
                  <TeamMemberProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/team/roles" 
              element={
                <ProtectedRoute>
                  <TeamRoles />
                </ProtectedRoute>
              } 
            />
            
            {/* Other Main Features */}
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/equipment" 
              element={
                <ProtectedRoute>
                  <Equipment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/equipment/:id" 
              element={
                <ProtectedRoute>
                  <EquipmentDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/maintenance" 
              element={
                <ProtectedRoute>
                  <Maintenance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calls" 
              element={
                <ProtectedRoute>
                  <CallLogger />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotes" 
              element={
                <ProtectedRoute>
                  <Quotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reminders" 
              element={
                <ProtectedRoute>
                  <Reminders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback" 
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/affiliate" 
              element={
                <ProtectedRoute>
                  <AffiliateTool />
                </ProtectedRoute>
              } 
            />
            
            {/* Developer Routes */}
            <Route 
              path="/developer" 
              element={
                <ProtectedRoute>
                  <DeveloperDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developer/service-management" 
              element={
                <ProtectedRoute>
                  <ServiceManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developer/service-management/overview" 
              element={
                <ProtectedRoute>
                  <ServiceManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developer/service-management/tree" 
              element={
                <ProtectedRoute>
                  <ServiceManagementTree />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developer/service-management/excel" 
              element={
                <ProtectedRoute>
                  <ServiceManagementExcel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developer/service-management/import" 
              element={
                <ProtectedRoute>
                  <ServiceManagementImport />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developer/shopping" 
              element={
                <ProtectedRoute>
                  <ShoppingSite />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </ServiceErrorBoundary>
      
      <Toaster />
    </div>
  );
}

export default App;
