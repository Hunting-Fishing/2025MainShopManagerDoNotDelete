
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { AuthGate } from '@/components/AuthGate';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Customers = lazy(() => import('@/pages/Customers'));
const CustomerDetails = lazy(() => import('@/pages/CustomerDetails'));
const CustomerCreate = lazy(() => import('@/pages/CustomerCreate'));
const WorkOrders = lazy(() => import('@/pages/WorkOrders'));
const WorkOrderDetails = lazy(() => import('@/pages/WorkOrderDetails'));
const WorkOrderCreate = lazy(() => import('@/pages/WorkOrderCreate'));
const WorkOrderEdit = lazy(() => import('@/pages/WorkOrderEdit'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const Calendar = lazy(() => import('@/pages/Calendar'));
const Settings = lazy(() => import('@/pages/Settings'));
const Team = lazy(() => import('@/pages/Team'));
const TeamCreate = lazy(() => import('@/pages/TeamCreate'));
const TeamMemberProfile = lazy(() => import('@/pages/TeamMemberProfile'));
const Authentication = lazy(() => import('@/pages/Authentication'));
const CustomerPortal = lazy(() => import('@/pages/CustomerPortal'));
const CustomerPortalLogin = lazy(() => import('@/pages/CustomerPortalLogin'));
const DeveloperPortal = lazy(() => import('@/pages/DeveloperPortal'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Additional pages
const Invoices = lazy(() => import('@/pages/Invoices'));
const InvoiceCreate = lazy(() => import('@/pages/InvoiceCreate'));
const InvoiceDetails = lazy(() => import('@/pages/InvoiceDetails'));
const Quotes = lazy(() => import('@/pages/Quotes'));
const Reports = lazy(() => import('@/pages/Reports'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const Equipment = lazy(() => import('@/pages/Equipment'));
const EquipmentDetails = lazy(() => import('@/pages/EquipmentDetails'));

function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Authentication />} />
          <Route path="/signup" element={<Authentication />} />
          <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
          
          {/* Customer Portal Routes */}
          <Route path="/customer-portal/*" element={<CustomerPortal />} />
          
          {/* Protected Main Application Routes */}
          <Route 
            path="/*" 
            element={
              <AuthGate>
                <OnboardingGate>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Customer Management */}
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/create" element={<CustomerCreate />} />
                      <Route path="/customers/:id" element={<CustomerDetails />} />
                      
                      {/* Work Orders */}
                      <Route path="/work-orders" element={<WorkOrders />} />
                      <Route path="/work-orders/create" element={<WorkOrderCreate />} />
                      <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                      <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />
                      
                      {/* Inventory & Parts */}
                      <Route path="/inventory" element={<Inventory />} />
                      
                      {/* Financial */}
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/invoices/create" element={<InvoiceCreate />} />
                      <Route path="/invoices/:id" element={<InvoiceDetails />} />
                      <Route path="/quotes" element={<Quotes />} />
                      
                      {/* Operations */}
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/equipment/:id" element={<EquipmentDetails />} />
                      
                      {/* Team Management */}
                      <Route path="/team" element={<Team />} />
                      <Route path="/team/create" element={<TeamCreate />} />
                      <Route path="/team/:id" element={<TeamMemberProfile />} />
                      
                      {/* Reports & Analytics */}
                      <Route path="/reports" element={<Reports />} />
                      
                      {/* Settings */}
                      <Route path="/settings/*" element={<Settings />} />
                      
                      {/* Developer Tools */}
                      <Route path="/developer/*" element={<DeveloperPortal />} />
                      
                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </OnboardingGate>
              </AuthGate>
            } 
          />
        </Routes>
      </Suspense>
      
      <Toaster />
    </>
  );
}

export default App;
