
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Import pages
import Dashboard from '@/pages/Dashboard';
import WorkOrders from '@/pages/WorkOrders';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Authentication from '@/pages/Authentication';
import Signup from '@/pages/Signup';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';

// Import placeholder pages
import {
  Team,
  Chat,
  Forms,
  Calendar,
  Reports,
  Invoices,
  Equipment,
  Feedback,
  Analytics,
  Inventory,
  TeamCreate,
  CustomerCreate,
  CustomerDetails,
  CustomerEdit,
  EquipmentDetails,
  InventoryCreate,
  InvoiceCreate,
  InvoiceDetails,
  Maintenance,
  Notifications,
  TeamMemberProfile,
  WorkOrderCreate,
  WorkOrderDetails,
  WorkOrderEdit
} from '@/pages/placeholders';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth" element={<Authentication />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/customer-portal" element={<CustomerPortalLogin />} />
      
      {/* Protected routes wrapped in Layout */}
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
      
      <Route path="/work-orders/create" element={
        <ProtectedRoute>
          <Layout>
            <WorkOrderCreate />
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
            <Team />
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
      
      <Route path="/calendar" element={
        <ProtectedRoute>
          <Layout>
            <Calendar />
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
      
      <Route path="/documents" element={
        <ProtectedRoute>
          <Layout>
            <Forms />
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
            <TeamCreate />
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
      
      <Route path="/maintenance" element={
        <ProtectedRoute>
          <Layout>
            <Maintenance />
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
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Layout>
            <Analytics />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
