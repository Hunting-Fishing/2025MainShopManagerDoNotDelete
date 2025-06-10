
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from "@/components/ui/tooltip"

import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import CustomerDetails from '@/pages/CustomerDetails';
import CreateCustomer from '@/pages/CreateCustomer';
import Calendar from '@/pages/Calendar';
import Inventory from '@/pages/Inventory';
import Invoices from '@/pages/Invoices';
import Reports from '@/pages/Reports';
import FeedbackAnalytics from '@/pages/FeedbackAnalytics';
import PartsTracking from '@/pages/PartsTracking';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/work-orders" element={<Layout><WorkOrders /></Layout>} />
              <Route path="/work-orders/:id" element={<Layout><WorkOrderDetails /></Layout>} />
              <Route path="/customers/:id" element={<Layout><CustomerDetails /></Layout>} />
              <Route path="/customers/create" element={<Layout><CreateCustomer /></Layout>} />
              <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
              <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
              <Route path="/parts-tracking" element={<Layout><PartsTracking /></Layout>} />
              <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
              <Route path="/reports" element={<Layout><Reports /></Layout>} />
              <Route path="/feedback-analytics" element={<Layout><FeedbackAnalytics /></Layout>} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
