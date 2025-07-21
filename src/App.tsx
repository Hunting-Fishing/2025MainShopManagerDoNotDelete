
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { AuthGate } from '@/components/AuthGate';

// Import all real pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import WorkOrders from '@/pages/WorkOrders';
import Inventory from '@/pages/Inventory';
import Calendar from '@/pages/Calendar';
import Quotes from '@/pages/Quotes';
import Invoices from '@/pages/Invoices';
import Settings from '@/pages/Settings';

// Import additional real pages
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerCreate from '@/pages/CustomerCreate';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderCreate from '@/pages/WorkOrderCreate';

// Create real page components for remaining routes
const ServiceReminders = React.lazy(() => import('@/pages/ServiceReminders'));
const CustomerComms = React.lazy(() => import('@/pages/CustomerComms'));
const CallLogger = React.lazy(() => import('@/pages/CallLogger'));
const ServiceBoard = React.lazy(() => import('@/pages/ServiceBoard'));
const Payments = React.lazy(() => import('@/pages/Payments'));
const CompanyProfile = React.lazy(() => import('@/pages/CompanyProfile'));
const Team = React.lazy(() => import('@/pages/Team'));
const Vehicles = React.lazy(() => import('@/pages/Vehicles'));
const Documents = React.lazy(() => import('@/pages/Documents'));
const ServiceEditor = React.lazy(() => import('@/pages/ServiceEditor'));
const Services = React.lazy(() => import('@/pages/Services'));
const RepairPlans = React.lazy(() => import('@/pages/RepairPlans'));
const Help = React.lazy(() => import('@/pages/Help'));
const Security = React.lazy(() => import('@/pages/Security'));

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <AuthGate>
              <Layout>
                <Dashboard />
              </Layout>
            </AuthGate>
          } />
          
          {/* Customer routes */}
          <Route path="/customers/*" element={
            <AuthGate>
              <Layout>
                <Customers />
              </Layout>
            </AuthGate>
          } />
          
          {/* Work Order routes */}
          <Route path="/work-orders/*" element={
            <AuthGate>
              <Layout>
                <WorkOrders />
              </Layout>
            </AuthGate>
          } />
          
          {/* Inventory routes with nested routing */}
          <Route path="/inventory/*" element={
            <AuthGate>
              <Layout>
                <Inventory />
              </Layout>
            </AuthGate>
          } />
          
          {/* Calendar */}
          <Route path="/calendar" element={
            <AuthGate>
              <Layout>
                <Calendar />
              </Layout>
            </AuthGate>
          } />
          
          {/* Service Reminders */}
          <Route path="/service-reminders" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ServiceReminders />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          {/* Customer Communications */}
          <Route path="/customer-comms" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <CustomerComms />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          {/* Call Logger */}
          <Route path="/call-logger" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <CallLogger />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          {/* Quotes */}
          <Route path="/quotes" element={
            <AuthGate>
              <Layout>
                <Quotes />
              </Layout>
            </AuthGate>
          } />
          
          {/* Invoices */}
          <Route path="/invoices" element={
            <AuthGate>
              <Layout>
                <Invoices />
              </Layout>
            </AuthGate>
          } />
          
          {/* Service Board */}
          <Route path="/service-board" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ServiceBoard />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          {/* Payments */}
          <Route path="/payments" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Payments />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          {/* Company routes */}
          <Route path="/company-profile" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <CompanyProfile />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/team" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Team />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/vehicles" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Vehicles />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/documents" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Documents />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          {/* Service routes */}
          <Route path="/service-editor" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <ServiceEditor />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/services" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Services />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/repair-plans" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <RepairPlans />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          {/* Settings with nested routing */}
          <Route path="/settings/*" element={
            <AuthGate>
              <Layout>
                <Settings />
              </Layout>
            </AuthGate>
          } />
          
          {/* Support routes */}
          <Route path="/help" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Help />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/security" element={
            <AuthGate>
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Security />
                </React.Suspense>
              </Layout>
            </AuthGate>
          } />
          
          {/* Catch all other routes */}
          <Route path="*" element={
            <AuthGate>
              <Layout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                  <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                </div>
              </Layout>
            </AuthGate>
          } />
        </Routes>
        <Toaster />
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
