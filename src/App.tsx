
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
import InventoryAdd from '@/pages/InventoryAdd';
import InventorySuppliers from '@/pages/InventorySuppliers';
import CreateWorkOrder from '@/pages/CreateWorkOrder';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerEdit from '@/pages/CustomerEdit';
import StockControl from '@/pages/StockControl';
import PurchaseOrders from '@/pages/PurchaseOrders';
import Calendar from '@/pages/Calendar';
import ServiceReminders from '@/pages/ServiceReminders';
import CustomerComms from '@/pages/CustomerComms';

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
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/service-reminders" element={<ServiceReminders />} />
            <Route path="/customer-comms" element={<CustomerComms />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:customerId" element={<CustomerDetails />} />
            <Route path="/customers/:customerId/edit" element={<CustomerEdit />} />
            <Route path="/customers/create" element={<CreateCustomer />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/work-orders/:workOrderId" element={<WorkOrderDetails />} />
            <Route path="/work-orders/create" element={<CreateWorkOrder />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/add" element={<InventoryAdd />} />
            <Route path="/inventory/suppliers" element={<InventorySuppliers />} />
            <Route path="/stock-control" element={<StockControl />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/documents" element={<Documents />} />
            
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
