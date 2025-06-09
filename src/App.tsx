import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from "@/components/ui/tooltip"

import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import Customers from '@/pages/Customers';
import CustomerDetails from '@/pages/CustomerDetails';
import CreateCustomer from '@/pages/CreateCustomer';
import Calendar from '@/pages/Calendar';
import Inventory from '@/pages/Inventory';
import Invoices from '@/pages/Invoices';
import Reports from '@/pages/Reports';
import ChatPage from '@/pages/chat/ChatPage';
import CallsPage from '@/pages/calls/CallsPage';
import ShoppingPage from '@/pages/shopping/ShoppingPage';
import DIYBayPage from '@/pages/diybay/DIYBayPage';
import EquipmentPage from '@/pages/equipment/EquipmentPage';
import CustomerPortalPage from '@/pages/customer-portal/CustomerPortalPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import DeveloperPortalPage from '@/pages/developer/DeveloperPortalPage';
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
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="work-orders" element={<WorkOrders />} />
                <Route path="work-orders/:id" element={<WorkOrderDetails />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/:id" element={<CustomerDetails />} />
                <Route path="customers/create" element={<CreateCustomer />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="parts-tracking" element={<PartsTracking />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="reports" element={<Reports />} />
                <Route path="chat/*" element={<ChatPage />} />
                <Route path="calls" element={<CallsPage />} />
                <Route path="shopping" element={<ShoppingPage />} />
                <Route path="diy-bay" element={<DIYBayPage />} />
                <Route path="equipment" element={<EquipmentPage />} />
                <Route path="customer-portal/*" element={<CustomerPortalPage />} />
                <Route path="settings/*" element={<SettingsPage />} />
                <Route path="developer/*" element={<DeveloperPortalPage />} />
                <Route path="feedback-analytics" element={<FeedbackAnalytics />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
