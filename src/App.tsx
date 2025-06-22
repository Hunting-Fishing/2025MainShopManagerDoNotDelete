import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthGate } from '@/components/AuthGate';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Customers = React.lazy(() => import('@/pages/Customers'));
const CustomerDetails = React.lazy(() => import('@/pages/CustomerDetails'));
const CustomerEdit = React.lazy(() => import('@/pages/CustomerEdit'));
const CustomerCreate = React.lazy(() => import('@/pages/CustomerCreate'));

// Placeholder pages for other routes
const WorkOrders = () => <div className="p-6"><h1 className="text-2xl font-bold">Work Orders</h1><p>Coming soon...</p></div>;
const Inventory = () => <div className="p-6"><h1 className="text-2xl font-bold">Inventory</h1><p>Coming soon...</p></div>;
const Invoices = () => <div className="p-6"><h1 className="text-2xl font-bold">Invoices</h1><p>Coming soon...</p></div>;
const Calendar = () => <div className="p-6"><h1 className="text-2xl font-bold">Calendar</h1><p>Coming soon...</p></div>;
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Coming soon...</p></div>;

function App() {
  return (
    <AuthGate>
      <OnboardingGate>
        <Layout>
          <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-lg">Loading...</div></div>}>
            <Routes>
              {/* Default redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Main pages */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/create" element={<CustomerCreate />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/customers/:id/edit" element={<CustomerEdit />} />
              
              {/* Other main routes */}
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Sidebar navigation routes - placeholder implementations */}
              <Route path="/suppliers" element={<div className="p-6"><h1 className="text-2xl font-bold">Suppliers</h1><p>Coming soon...</p></div>} />
              <Route path="/stock-control" element={<div className="p-6"><h1 className="text-2xl font-bold">Stock Control</h1><p>Coming soon...</p></div>} />
              <Route path="/purchase-orders" element={<div className="p-6"><h1 className="text-2xl font-bold">Purchase Orders</h1><p>Coming soon...</p></div>} />
              <Route path="/service-reminders" element={<div className="p-6"><h1 className="text-2xl font-bold">Service Reminders</h1><p>Coming soon...</p></div>} />
              <Route path="/customer-comms" element={<div className="p-6"><h1 className="text-2xl font-bold">Customer Communications</h1><p>Coming soon...</p></div>} />
              <Route path="/call-logger" element={<div className="p-6"><h1 className="text-2xl font-bold">Call Logger</h1><p>Coming soon...</p></div>} />
              <Route path="/quotes" element={<div className="p-6"><h1 className="text-2xl font-bold">Quotes</h1><p>Coming soon...</p></div>} />
              <Route path="/service-board" element={<div className="p-6"><h1 className="text-2xl font-bold">Service Board</h1><p>Coming soon...</p></div>} />
              <Route path="/company-profile" element={<div className="p-6"><h1 className="text-2xl font-bold">Company Profile</h1><p>Coming soon...</p></div>} />
              <Route path="/staff-members" element={<div className="p-6"><h1 className="text-2xl font-bold">Staff Members</h1><p>Coming soon...</p></div>} />
              <Route path="/vehicles" element={<div className="p-6"><h1 className="text-2xl font-bold">Vehicles</h1><p>Coming soon...</p></div>} />
              <Route path="/documents" element={<div className="p-6"><h1 className="text-2xl font-bold">Documents</h1><p>Coming soon...</p></div>} />
              <Route path="/service-editor" element={<div className="p-6"><h1 className="text-2xl font-bold">Service Editor</h1><p>Coming soon...</p></div>} />
              <Route path="/service-library" element={<div className="p-6"><h1 className="text-2xl font-bold">Service Library</h1><p>Coming soon...</p></div>} />
              <Route path="/help" element={<div className="p-6"><h1 className="text-2xl font-bold">Help</h1><p>Coming soon...</p></div>} />
              <Route path="/security" element={<div className="p-6"><h1 className="text-2xl font-bold">Security</h1><p>Coming soon...</p></div>} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </React.Suspense>
        </Layout>
      </OnboardingGate>
    </AuthGate>
  );
}

export default App;
