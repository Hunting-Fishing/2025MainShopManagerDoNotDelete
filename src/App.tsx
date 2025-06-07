
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';

// Layout
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import WorkOrders from '@/pages/WorkOrders';
import Inventory from '@/pages/Inventory';
import Equipment from '@/pages/Equipment';
import Team from '@/pages/Team';
import TeamProfile from '@/pages/TeamProfile';
import Settings from '@/pages/Settings';
import Reports from '@/pages/Reports';
import Maintenance from '@/pages/Maintenance';
import Calendar from '@/pages/Calendar';
import Developer from '@/pages/Developer';
import DeveloperPortal from '@/pages/DeveloperPortal';
import CustomerPortal from '@/pages/CustomerPortal';
import CustomerDetails from '@/pages/CustomerDetails';
import VehicleDetails from '@/pages/VehicleDetails';
import CreateCustomer from '@/pages/CreateCustomer';
import CreateWorkOrder from '@/pages/CreateWorkOrder';
import EditWorkOrder from '@/pages/EditWorkOrder';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import CreateTeamMember from '@/pages/CreateTeamMember';
import CreateInventoryItem from '@/pages/CreateInventoryItem';
import InventoryDetails from '@/pages/InventoryDetails';
import EquipmentDetails from '@/pages/EquipmentDetails';
import RepairPlanDetails from '@/pages/RepairPlanDetails';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import CreateInvoice from '@/pages/CreateInvoice';
import InvoiceDetails from '@/pages/InvoiceDetails';
import OnboardingFlow from '@/pages/OnboardingFlow';
import Chat from '@/pages/Chat';
import TeamRoles from '@/pages/TeamRoles';
import Reminders from '@/pages/Reminders';
import AffiliatePage from '@/pages/AffiliatePage';
import AffiliateProductsPage from '@/pages/AffiliateProductsPage';

// Auth Pages
import AuthPage from '@/pages/AuthPage';

// Developer sub-pages
import OrganizationManagement from '@/pages/developer/OrganizationManagement';
import ServiceManagement from '@/pages/developer/ServiceManagement';
import ShoppingControls from '@/pages/developer/ShoppingControls';
import UserManagement from '@/pages/developer/UserManagement';
import SystemSettings from '@/pages/developer/SystemSettings';
import ToolsManagement from '@/pages/developer/ToolsManagement';
import AnalyticsDashboard from '@/pages/developer/AnalyticsDashboard';
import SecuritySettings from '@/pages/developer/SecuritySettings';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Try again
    </button>
  </div>
);

// Create QueryClient with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        console.log('Query failed:', error);
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error Boundary caught an error:', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/customer-portal" element={<CustomerPortal />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/create" element={<CreateCustomer />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="customers/:customerId/vehicles/:vehicleId" element={<VehicleDetails />} />
              
              <Route path="work-orders" element={<WorkOrders />} />
              <Route path="work-orders/create" element={<CreateWorkOrder />} />
              <Route path="work-orders/:id" element={<WorkOrderDetails />} />
              <Route path="work-orders/:id/edit" element={<EditWorkOrder />} />
              
              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/create" element={<CreateInventoryItem />} />
              <Route path="inventory/:id" element={<InventoryDetails />} />
              
              <Route path="equipment" element={<Equipment />} />
              <Route path="equipment/:id" element={<EquipmentDetails />} />
              
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="repair-plans/create" element={<CreateRepairPlan />} />
              <Route path="repair-plans/:id" element={<RepairPlanDetails />} />
              
              <Route path="team" element={<Team />} />
              <Route path="team/create" element={<CreateTeamMember />} />
              <Route path="team/:id" element={<TeamProfile />} />
              <Route path="team/roles" element={<TeamRoles />} />
              
              <Route path="invoices/create" element={<CreateInvoice />} />
              <Route path="invoices/:id" element={<InvoiceDetails />} />
              
              <Route path="calendar" element={<Calendar />} />
              <Route path="chat" element={<Chat />} />
              <Route path="reminders" element={<Reminders />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="onboarding" element={<OnboardingFlow />} />
              
              <Route path="affiliate" element={<AffiliatePage />} />
              <Route path="affiliate/products" element={<AffiliateProductsPage />} />
              
              {/* Developer Routes - Protected with admin role */}
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
              <Route path="developer/service-management" element={
                <ProtectedRoute requiredRole="admin">
                  <ServiceManagement />
                </ProtectedRoute>
              } />
              <Route path="developer/shopping-controls" element={
                <ProtectedRoute requiredRole="admin">
                  <ShoppingControls />
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
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
