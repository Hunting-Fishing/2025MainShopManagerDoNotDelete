
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthGate } from '@/components/AuthGate';

// Import pages
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Authentication from '@/pages/Authentication';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';

// Import page components
import { CustomersPage } from '@/components/customers/CustomersPage';
import { ServiceManagementPage } from '@/pages/developer/ServiceManagementPage';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const WorkOrders = React.lazy(() => import('@/pages/WorkOrders'));
const WorkOrderDetails = React.lazy(() => import('@/pages/WorkOrderDetails'));
const WorkOrderCreate = React.lazy(() => import('@/pages/WorkOrderCreate'));
const WorkOrderEdit = React.lazy(() => import('@/pages/WorkOrderEdit'));
const CustomerDetails = React.lazy(() => import('@/pages/CustomerDetails'));
const CustomerCreate = React.lazy(() => import('@/pages/CustomerCreate'));
const CustomerEdit = React.lazy(() => import('@/pages/CustomerEdit'));
const Inventory = React.lazy(() => import('@/pages/Inventory'));
const InventoryCreate = React.lazy(() => import('@/pages/InventoryCreate'));
const Invoices = React.lazy(() => import('@/pages/Invoices'));
const InvoiceDetails = React.lazy(() => import('@/pages/InvoiceDetails'));
const InvoiceCreate = React.lazy(() => import('@/pages/InvoiceCreate'));
const Calendar = React.lazy(() => import('@/pages/Calendar'));
const Equipment = React.lazy(() => import('@/pages/Equipment'));
const EquipmentDetails = React.lazy(() => import('@/pages/EquipmentDetails'));
const Maintenance = React.lazy(() => import('@/pages/Maintenance'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Team = React.lazy(() => import('@/pages/Team'));
const TeamMemberProfile = React.lazy(() => import('@/pages/TeamMemberProfile'));
const TeamCreate = React.lazy(() => import('@/pages/TeamCreate'));
const Notifications = React.lazy(() => import('@/pages/Notifications'));
const Forms = React.lazy(() => import('@/pages/Forms'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const Feedback = React.lazy(() => import('@/pages/Feedback'));
const DeveloperPortal = React.lazy(() => import('@/pages/DeveloperPortal'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/customer-portal" element={<CustomerPortalLogin />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={
              <AuthGate>
                <Layout>
                  <Routes>
                    {/* Dashboard */}
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* Work Orders */}
                    <Route path="work-orders" element={<WorkOrders />} />
                    <Route path="work-orders/create" element={<WorkOrderCreate />} />
                    <Route path="work-orders/:id" element={<WorkOrderDetails />} />
                    <Route path="work-orders/:id/edit" element={<WorkOrderEdit />} />
                    
                    {/* Customers */}
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="customers/create" element={<CustomerCreate />} />
                    <Route path="customers/:id" element={<CustomerDetails />} />
                    <Route path="customers/:id/edit" element={<CustomerEdit />} />
                    
                    {/* Inventory */}
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="inventory/create" element={<InventoryCreate />} />
                    
                    {/* Invoices */}
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="invoices/create" element={<InvoiceCreate />} />
                    <Route path="invoices/:id" element={<InvoiceDetails />} />
                    
                    {/* Calendar */}
                    <Route path="calendar" element={<Calendar />} />
                    
                    {/* Equipment */}
                    <Route path="equipment" element={<Equipment />} />
                    <Route path="equipment/:id" element={<EquipmentDetails />} />
                    
                    {/* Maintenance */}
                    <Route path="maintenance" element={<Maintenance />} />
                    
                    {/* Reports */}
                    <Route path="reports" element={<Reports />} />
                    
                    {/* Analytics */}
                    <Route path="analytics" element={<Analytics />} />
                    
                    {/* Team Management */}
                    <Route path="team" element={<Team />} />
                    <Route path="team/create" element={<TeamCreate />} />
                    <Route path="team/:id" element={<TeamMemberProfile />} />
                    
                    {/* Settings */}
                    <Route path="settings/*" element={<Settings />} />
                    
                    {/* Notifications */}
                    <Route path="notifications" element={<Notifications />} />
                    
                    {/* Forms */}
                    <Route path="forms" element={<Forms />} />
                    
                    {/* Chat */}
                    <Route path="chat" element={<Chat />} />
                    
                    {/* Feedback */}
                    <Route path="feedback" element={<Feedback />} />
                    
                    {/* Developer Portal - Admin/Owner only */}
                    <Route path="developer/*" element={
                      <ProtectedRoute requireOwner={true}>
                        <DeveloperPortal />
                      </ProtectedRoute>
                    } />
                    
                    {/* Service Management - nested under developer */}
                    <Route path="developer/service-management/*" element={
                      <ProtectedRoute requireOwner={true}>
                        <ServiceManagementPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch all redirect */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </AuthGate>
            } />
            
            {/* Fallback for any unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
        
        {/* Global toast notifications */}
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
