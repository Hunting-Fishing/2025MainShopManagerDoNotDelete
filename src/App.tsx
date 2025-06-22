
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/Layout';
import { AuthGate } from '@/components/AuthGate';

// Import pages that exist
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CustomerDetails from '@/pages/CustomerDetails';
import Quotes from '@/pages/Quotes';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import Invoices from '@/pages/Invoices';
import Documents from '@/pages/Documents';
import Inventory from '@/pages/Inventory';
import CreateWorkOrder from '@/pages/CreateWorkOrder';
import CreateCustomer from '@/pages/CreateCustomer';

function App() {
  return (
    <>
      <Helmet>
        <title>ServicePro</title>
        <meta name="description" content="Professional service management platform" />
      </Helmet>
      
      <AuthGate>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:customerId" element={<CustomerDetails />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/work-orders/:workOrderId" element={<WorkOrderDetails />} />
            <Route path="/work-orders/create" element={<CreateWorkOrder />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/customers/create" element={<CreateCustomer />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </AuthGate>
      
      <Toaster />
    </>
  );
}

export default App;
