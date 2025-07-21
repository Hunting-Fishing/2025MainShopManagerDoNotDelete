
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/context/notifications';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Pages
import Dashboard from '@/pages/Dashboard';
import ProductCatalog from '@/pages/ProductCatalog';
import ProductDetail from '@/pages/ProductDetail';
import ShoppingCart from '@/pages/ShoppingCart';
import CustomerPortal from '@/pages/CustomerPortal';
import WorkOrders from '@/pages/WorkOrders';
import Customers from '@/pages/Customers';
import Inventory from '@/pages/Inventory';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Calendar from '@/pages/Calendar';
import TeamManagement from '@/pages/TeamManagement';
import Help from '@/pages/Help';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CompanyProvider>
            <NotificationProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route
                  path="/*"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          
                          {/* Store */}
                          <Route path="/shopping" element={<ProductCatalog />} />
                          <Route path="/shopping/:id" element={<ProductDetail />} />
                          <Route path="/cart" element={<ShoppingCart />} />
                          <Route path="/customer-portal" element={<CustomerPortal />} />
                          
                          {/* Work Management */}
                          <Route path="/work-orders" element={
                            <ProtectedRoute requiredPermissions={['work_orders_read']}>
                              <WorkOrders />
                            </ProtectedRoute>
                          } />
                          
                          {/* Customer Management */}
                          <Route path="/customers" element={
                            <ProtectedRoute requiredPermissions={['customers_read']}>
                              <Customers />
                            </ProtectedRoute>
                          } />
                          
                          {/* Inventory */}
                          <Route path="/inventory" element={
                            <ProtectedRoute requiredPermissions={['inventory_read']}>
                              <Inventory />
                            </ProtectedRoute>
                          } />
                          
                          {/* Analytics */}
                          <Route path="/analytics" element={
                            <ProtectedRoute requiredPermissions={['analytics_read']}>
                              <Analytics />
                            </ProtectedRoute>
                          } />
                          
                          {/* Settings */}
                          <Route path="/settings" element={
                            <ProtectedRoute requiredPermissions={['settings_read']}>
                              <Settings />
                            </ProtectedRoute>
                          } />
                          
                          {/* Calendar */}
                          <Route path="/calendar" element={<Calendar />} />
                          
                          {/* Team Management */}
                          <Route path="/team" element={
                            <ProtectedRoute requiredPermissions={['team_read']}>
                              <TeamManagement />
                            </ProtectedRoute>
                          } />
                          
                          {/* Help & Support - Now using the comprehensive Help component */}
                          <Route path="/help" element={<Help />} />
                          
                          {/* Catch all */}
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </Layout>
                    </AuthGuard>
                  }
                />
              </Routes>
            </NotificationProvider>
          </CompanyProvider>
        </AuthProvider>
      </Router>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
