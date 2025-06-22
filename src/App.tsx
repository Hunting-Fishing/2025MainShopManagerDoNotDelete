import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/Layout';
import { AuthGate } from '@/components/AuthGate';

// Import pages
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerPortal from '@/pages/CustomerPortal';
import Suppliers from '@/pages/Suppliers';
import StockControl from '@/pages/StockControl';
import PurchaseOrders from '@/pages/PurchaseOrders';
import CalendarPage from '@/pages/CalendarPage';
import ServiceReminders from '@/pages/ServiceReminders';
import CustomerComms from '@/pages/CustomerComms';
import CallLogger from '@/pages/CallLogger';
import Quotes from '@/pages/Quotes';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import Invoices from '@/pages/Invoices';
import ServiceBoard from '@/pages/ServiceBoard';
import CompanyProfile from '@/pages/CompanyProfile';
import StaffMembers from '@/pages/StaffMembers';
import Vehicles from '@/pages/Vehicles';
import Documents from '@/pages/Documents';
import ServiceEditor from '@/pages/ServiceEditor';
import ServiceLibrary from '@/pages/ServiceLibrary';
import SettingsPage from '@/pages/SettingsPage';
import Help from '@/pages/Help';
import Security from '@/pages/Security';
import Inventory from '@/pages/Inventory';
import CreateWorkOrder from '@/pages/CreateWorkOrder';
import EditCustomer from '@/pages/EditCustomer';
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
            <Route path="/customer-portal/:customerId" element={<CustomerPortal />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/stock-control" element={<StockControl />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/service-reminders" element={<ServiceReminders />} />
            <Route path="/customer-comms" element={<CustomerComms />} />
            <Route path="/call-logger" element={<CallLogger />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/work-orders/:workOrderId" element={<WorkOrderDetails />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/service-board" element={<ServiceBoard />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/staff-members" element={<StaffMembers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/service-editor" element={<ServiceEditor />} />
            <Route path="/service-library" element={<ServiceLibrary />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<Help />} />
            <Route path="/security" element={<Security />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/work-orders/create" element={<CreateWorkOrder />} />
            <Route path="/customers/:customerId/edit" element={<EditCustomer />} />
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
