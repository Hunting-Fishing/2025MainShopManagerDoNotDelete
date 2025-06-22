import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load pages
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
const Team = React.lazy(() => import('@/pages/Team'));
const TeamMemberProfile = React.lazy(() => import('@/pages/TeamMemberProfile'));
const TeamCreate = React.lazy(() => import('@/pages/TeamCreate'));
const Notifications = React.lazy(() => import('@/pages/Notifications'));
const Forms = React.lazy(() => import('@/pages/Forms'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const Feedback = React.lazy(() => import('@/pages/Feedback'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const DeveloperPortal = React.lazy(() => import('@/pages/DeveloperPortal'));
const Login = React.lazy(() => import('@/pages/Login'));
const Signup = React.lazy(() => import('@/pages/Signup'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Navigate to="/dashboard" replace />
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

          {/* Work Orders */}
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
          <Route path="/work-orders/create" element={
            <ProtectedRoute>
              <Layout>
                <WorkOrderCreate />
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

          {/* Customers */}
          <Route path="/customers" element={
            <ProtectedRoute>
              <Layout>
                <Customers />
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
          <Route path="/customers/create" element={
            <ProtectedRoute>
              <Layout>
                <CustomerCreate />
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

          {/* Inventory */}
          <Route path="/inventory" element={
            <ProtectedRoute>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/inventory/create" element={
            <ProtectedRoute>
              <Layout>
                <InventoryCreate />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Invoices */}
          <Route path="/invoices" element={
            <ProtectedRoute>
              <Layout>
                <Invoices />
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
          <Route path="/invoices/create" element={
            <ProtectedRoute>
              <Layout>
                <InvoiceCreate />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Other Routes */}
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Layout>
                <Calendar />
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
                <Maintenance />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
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
          <Route path="/team" element={
            <ProtectedRoute>
              <Layout>
                <Team />
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
          <Route path="/team/create" element={
            <ProtectedRoute>
              <Layout>
                <TeamCreate />
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
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Developer Routes */}
          <Route path="/developer" element={
            <ProtectedRoute allowedRoles={['admin', 'developer']}>
              <Layout>
                <DeveloperPortal />
              </Layout>
            </ProtectedRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </div>
  );
}

export default App;
