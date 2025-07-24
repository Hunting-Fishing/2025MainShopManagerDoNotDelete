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
import TeamManagement from '@/pages/TeamManagement';
import Help from '@/pages/Help';
import ServiceReminders from '@/pages/ServiceReminders';
import Login from '@/pages/Login';
import { ArticleViewer } from '@/components/help/ArticleViewer';
import { LearningPathDetail } from '@/components/help/LearningPathDetail';

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
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                      <WorkOrders />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Management */}
                  <Route path="/customers" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
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
                  <Route path="/service-reminders" element={<ServiceReminders />} />
                  
                  {/* Team Management */}
                  <Route path="/team" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                      <TeamManagement />
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