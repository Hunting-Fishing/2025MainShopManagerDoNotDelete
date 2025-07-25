import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthGate } from '@/components/AuthGate';

// Pages
import Dashboard from '@/pages/Dashboard';
import Shopping from '@/pages/Shopping';
import ProductDetail from '@/pages/ProductDetail';
import CustomerPortal from '@/pages/CustomerPortal';
import WorkOrders from '@/pages/WorkOrders';
import Customers from '@/pages/Customers';
import Inventory from '@/pages/Inventory';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Calendar from '@/pages/Calendar';
import Team from '@/pages/Team';
import CustomerComms from '@/pages/CustomerComms';
import CallLogger from '@/pages/CallLogger';
import Help from '@/pages/Help';
import ServiceReminders from '@/pages/ServiceReminders';
import Quotes from '@/pages/Quotes';
import Invoices from '@/pages/Invoices';
import ServiceBoard from '@/pages/ServiceBoard';
import Payments from '@/pages/Payments';
import CompanyProfile from '@/pages/CompanyProfile';
import VehiclesPage from '@/pages/VehiclesPage';
import Documents from '@/pages/Documents';
import ServiceCatalog from '@/pages/ServiceCatalog';
import RepairPlans from '@/pages/RepairPlans';
import Login from '@/pages/Login';
import { ArticleViewer } from '@/components/help/ArticleViewer';
import { LearningPathDetail } from '@/components/help/LearningPathDetail';
import { ServiceManagementPage } from '@/pages/developer/ServiceManagementPage';

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <AuthGate>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Store */}
                  <Route path="/shopping" element={<Shopping />} />
                  <Route path="/shopping/:id" element={<ProductDetail />} />
                  <Route path="/customer-portal" element={<CustomerPortal />} />
                  
                  {/* Work Management */}
                  <Route path="/work-orders" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'owner']}>
                      <WorkOrders />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Management */}
                  <Route path="/customers" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'reception', 'owner']}>
                      <Customers />
                    </ProtectedRoute>
                  } />
                  
                   {/* Inventory */}
                   <Route path="/inventory/*" element={
                     <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'inventory_manager', 'owner']}>
                       <Inventory />
                     </ProtectedRoute>
                   } />
                  
                  {/* Analytics */}
                  <Route path="/analytics" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  
                  {/* Settings */}
                  <Route path="/settings" element={
                    <ProtectedRoute requireAdmin={true}>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  
                  {/* Calendar */}
                  <Route path="/calendar" element={<Calendar />} />
                  
                  {/* Service Reminders */}
                  <Route path="/service-reminders" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'reception', 'owner']}>
                      <ServiceReminders />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Communications */}
                  <Route path="/customer-comms" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'reception', 'owner']}>
                      <CustomerComms />
                    </ProtectedRoute>
                  } />
                  
                  {/* Call Logger */}
                  <Route path="/call-logger" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'reception', 'owner']}>
                      <CallLogger />
                    </ProtectedRoute>
                  } />
                  
                  {/* Operations */}
                  <Route path="/quotes" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'owner']}>
                      <Quotes />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/invoices" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'owner']}>
                      <Invoices />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service-board" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'owner']}>
                      <ServiceBoard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/payments" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'owner']}>
                      <Payments />
                    </ProtectedRoute>
                  } />
                  
                  {/* Company */}
                  <Route path="/company-profile" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <CompanyProfile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vehicles" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'owner']}>
                      <VehiclesPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/documents" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'service_advisor', 'reception', 'owner']}>
                      <Documents />
                    </ProtectedRoute>
                  } />
                  
                  {/* Team Management */}
                  <Route path="/team/*" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <Team />
                    </ProtectedRoute>
                  } />
                  
                  {/* Services */}
                  <Route path="/services" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'owner']}>
                      <ServiceCatalog />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/service-editor" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'owner']}>
                      <ServiceManagementPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/repair-plans" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'technician', 'service_advisor', 'owner']}>
                      <RepairPlans />
                    </ProtectedRoute>
                  } />
                  
                  {/* Help & Support */}
                  <Route path="/help" element={<Help />} />
                  <Route path="/help/article/:articleId" element={<ArticleViewer />} />
                  <Route path="/help/path/:pathId" element={<LearningPathDetail />} />
                  
                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </AuthGate>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;