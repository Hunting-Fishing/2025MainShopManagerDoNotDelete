
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
import CallLogger from '@/pages/CallLogger';
import ServiceBoard from '@/pages/ServiceBoard';
import CompanyProfile from '@/pages/CompanyProfile';
import StaffMembers from '@/pages/StaffMembers';

// Create placeholder pages for missing routes
const VehiclesPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Vehicles</h1>
    <p className="text-gray-600">Vehicle management coming soon...</p>
  </div>
);

const ServiceEditorPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Service Editor</h1>
    <p className="text-gray-600">Service editor coming soon...</p>
  </div>
);

const ServiceLibraryPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Service Library</h1>
    <p className="text-gray-600">Service library coming soon...</p>
  </div>
);

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Settings</h1>
    <p className="text-gray-600">Settings page coming soon...</p>
  </div>
);

const HelpPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Help</h1>
    <p className="text-gray-600">Help documentation coming soon...</p>
  </div>
);

const SecurityPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Security</h1>
    <p className="text-gray-600">Security settings coming soon...</p>
  </div>
);

const SuppliersPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Suppliers</h1>
    <p className="text-gray-600">Suppliers management coming soon...</p>
  </div>
);

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
            
            {/* Scheduling */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/service-reminders" element={<ServiceReminders />} />
            
            {/* Communications */}
            <Route path="/customer-comms" element={<CustomerComms />} />
            <Route path="/call-logger" element={<CallLogger />} />
            
            {/* Customers */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:customerId" element={<CustomerDetails />} />
            <Route path="/customers/:customerId/edit" element={<CustomerEdit />} />
            <Route path="/customers/create" element={<CreateCustomer />} />
            
            {/* Inventory */}
            <Route path="/products" element={<Inventory />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/add" element={<InventoryAdd />} />
            <Route path="/inventory/suppliers" element={<InventorySuppliers />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/stock-control" element={<StockControl />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            
            {/* Operations */}
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/work-orders/:workOrderId" element={<WorkOrderDetails />} />
            <Route path="/work-orders/create" element={<CreateWorkOrder />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/service-board" element={<ServiceBoard />} />
            
            {/* Company */}
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/staff-members" element={<StaffMembers />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/documents" element={<Documents />} />
            
            {/* Services */}
            <Route path="/service-editor" element={<ServiceEditorPage />} />
            <Route path="/service-library" element={<ServiceLibraryPage />} />
            
            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Support */}
            <Route path="/help" element={<HelpPage />} />
            <Route path="/security" element={<SecurityPage />} />
            
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
