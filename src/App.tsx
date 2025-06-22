
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from "@/components/ui/tooltip"
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';

import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import CreateWorkOrder from '@/pages/CreateWorkOrder';
import Customers from '@/pages/Customers';
import CustomerDetails from '@/pages/CustomerDetails';
import CreateCustomer from '@/pages/CreateCustomer';
import Calendar from '@/pages/Calendar';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import Invoices from '@/pages/Invoices';
import Reports from '@/pages/Reports';
import FeedbackAnalytics from '@/pages/FeedbackAnalytics';
import PartsTracking from '@/pages/PartsTracking';
import QuoteDetails from './pages/QuoteDetails';
import Quotes from './pages/Quotes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('auth') || error?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/work-orders" element={
                  <ProtectedRoute requireOwner>
                    <Layout><WorkOrders /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/work-orders/create" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><CreateWorkOrder /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/work-orders/:id" element={
                  <ProtectedRoute requireOwner>
                    <Layout><WorkOrderDetails /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/customers" element={
                  <ProtectedRoute requireOwner>
                    <Layout><Customers /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/customers/:id" element={
                  <ProtectedRoute requireOwner>
                    <Layout><CustomerDetails /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/customers/create" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><CreateCustomer /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <Layout><Calendar /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/inventory" element={
                  <ProtectedRoute>
                    <Layout><Inventory /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/inventory/add" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><InventoryAdd /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/parts-tracking" element={
                  <ProtectedRoute>
                    <Layout><PartsTracking /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/invoices" element={
                  <ProtectedRoute requireOwner>
                    <Layout><Invoices /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requireOwner>
                    <Layout><Reports /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/feedback-analytics" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><FeedbackAnalytics /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/quotes" element={
                  <ProtectedRoute requireOwner>
                    <Layout><Quotes /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/quotes/:id" element={
                  <ProtectedRoute requireOwner>
                    <Layout><QuoteDetails /></Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
