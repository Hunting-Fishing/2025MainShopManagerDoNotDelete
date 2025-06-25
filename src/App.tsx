
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthGate } from '@/components/AuthGate';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { Layout } from '@/components/layout/Layout';

// Public pages (no auth required)
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';

// Protected pages (auth required)
import Dashboard from '@/pages/Dashboard';

// Lazy load other protected pages
const Customers = React.lazy(() => import('@/pages/Customers'));
const WorkOrders = React.lazy(() => import('@/pages/WorkOrders'));
const Inventory = React.lazy(() => import('@/pages/Inventory'));
const Team = React.lazy(() => import('@/pages/Team'));
const Settings = React.lazy(() => import('@/pages/Settings'));

// Customer detail pages
const CustomerDetailsPage = React.lazy(() => import('@/pages/CustomersPage'));
const CustomerEdit = React.lazy(() => import('@/pages/CustomerEdit'));

// Placeholder components for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-600">This page is under development.</p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/customer-portal" element={<CustomerPortalLogin />} />
        
        {/* Protected routes - authentication required */}
        <Route path="/*" element={
          <AuthGate>
            <OnboardingGate>
              <Layout>
                <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/create" element={<CustomerDetailsPage />} />
                    <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />
                    <Route path="/customers/:customerId/edit" element={<CustomerEdit />} />
                    <Route path="/work-orders/*" element={<WorkOrders />} />
                    <Route path="/inventory/*" element={<Inventory />} />
                    <Route path="/team/*" element={<Team />} />
                    <Route path="/settings/*" element={<Settings />} />
                    
                    {/* Add missing routes with placeholder pages */}
                    <Route path="/inventory/suppliers" element={<PlaceholderPage title="Suppliers" />} />
                    <Route path="/stock-control" element={<PlaceholderPage title="Stock Control" />} />
                    <Route path="/purchase-orders" element={<PlaceholderPage title="Purchase Orders" />} />
                    <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
                    <Route path="/service-reminders" element={<PlaceholderPage title="Service Reminders" />} />
                    <Route path="/customer-comms" element={<PlaceholderPage title="Customer Communications" />} />
                    <Route path="/call-logger" element={<PlaceholderPage title="Call Logger" />} />
                    <Route path="/quotes" element={<PlaceholderPage title="Quotes" />} />
                    <Route path="/invoices" element={<PlaceholderPage title="Invoices" />} />
                    <Route path="/service-board" element={<PlaceholderPage title="Service Board" />} />
                    <Route path="/company-profile" element={<PlaceholderPage title="Company Profile" />} />
                    <Route path="/staff-members" element={<PlaceholderPage title="Staff Members" />} />
                    <Route path="/vehicles" element={<PlaceholderPage title="Vehicles" />} />
                    <Route path="/documents" element={<PlaceholderPage title="Documents" />} />
                    <Route path="/service-editor" element={<PlaceholderPage title="Service Editor" />} />
                    <Route path="/service-library" element={<PlaceholderPage title="Service Library" />} />
                    <Route path="/help" element={<PlaceholderPage title="Help" />} />
                    <Route path="/security" element={<PlaceholderPage title="Security" />} />
                  </Routes>
                </React.Suspense>
              </Layout>
            </OnboardingGate>
          </AuthGate>
        } />
      </Routes>
      
      <Toaster />
    </div>
  );
}

export default App;
