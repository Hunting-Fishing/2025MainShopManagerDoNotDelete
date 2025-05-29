import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactErrorBoundary } from "@/components/error/ReactErrorBoundary";
import AuthGate from "@/components/AuthGate";
import OnboardingGate from "@/components/onboarding/OnboardingGate";
import Layout from "@/components/layout/Layout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import WorkOrders from "@/pages/WorkOrders";
import Inventory from "@/pages/Inventory";
import Invoices from "@/pages/Invoices";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Calendar from "@/pages/Calendar";
import Equipment from "@/pages/Equipment";
import CustomerDetails from "@/pages/CustomerDetails";
import WorkOrderDetails from "@/pages/WorkOrderDetails";
import InvoiceDetails from "@/pages/InvoiceDetails";
import CreateInvoice from "@/pages/CreateInvoice";
import CreateWorkOrder from "@/pages/CreateWorkOrder";
import CreateCustomer from "@/pages/CreateCustomer";
import Reminders from "@/pages/Reminders";
import EquipmentDetails from "@/pages/EquipmentDetails";
import VehicleDetails from "@/pages/VehicleDetails";
import Maintenance from "@/pages/Maintenance";
import Analytics from "@/pages/Analytics";
import TeamManagement from "@/pages/TeamManagement";
import Feedback from "@/pages/Feedback";
import FeedbackForm from "@/pages/FeedbackForm";
import FeedbackAnalytics from "@/pages/FeedbackAnalytics";
import Forms from "@/pages/Forms";
import Notifications from "@/pages/Notifications";
import CustomerPortal from "@/pages/CustomerPortal";
import CustomerPortalLogin from "@/pages/CustomerPortalLogin";
import ShoppingPortal from "@/pages/ShoppingPortal";
import Developer from "@/pages/Developer";
import Chat from "@/pages/Chat";
import Authentication from "./pages/Authentication";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { Profile } from "./types";
import { useLocation } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ReactErrorBoundary>
          <Router>
            <Routes>
              {/* Customer Portal Routes - No Auth Required */}
              <Route path="/customer-portal" element={<CustomerPortal />} />
              <Route path="/customer-portal/login" element={<CustomerPortalLogin />} />
              
              {/* Shopping Portal - No Auth Required */}
              <Route path="/shopping/*" element={<ShoppingPortal />} />
              
              {/* Feedback Form - No Auth Required */}
              <Route path="/feedback/:formId" element={<FeedbackForm />} />
              
              {/* Protected Routes */}
              <Route path="/*" element={
                <AuthGate>
                  <OnboardingGate>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/customers/new" element={<CreateCustomer />} />
                        <Route path="/customers/:id" element={<CustomerDetails />} />
                        <Route path="/customers/:customerId/vehicles/:vehicleId" element={<VehicleDetails />} />
                        <Route path="/work-orders" element={<WorkOrders />} />
                        <Route path="/work-orders/new" element={<CreateWorkOrder />} />
                        <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/invoices/new" element={<CreateInvoice />} />
                        <Route path="/invoices/:id" element={<InvoiceDetails />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/equipment" element={<Equipment />} />
                        <Route path="/equipment/:id" element={<EquipmentDetails />} />
                        <Route path="/reminders" element={<Reminders />} />
                        <Route path="/maintenance" element={<Maintenance />} />
                        <Route path="/team" element={<TeamManagement />} />
                        <Route path="/feedback" element={<Feedback />} />
                        <Route path="/feedback/analytics/:formId" element={<FeedbackAnalytics />} />
                        <Route path="/forms" element={<Forms />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/developer" element={<Developer />} />
                        <Route path="/chat" element={<Chat />} />
                        
                        {/* Redirect any old inventory routes to the main inventory page */}
                        <Route path="/inventory/stock" element={<Navigate to="/inventory" replace />} />
                        <Route path="/inventory/*" element={<Navigate to="/inventory" replace />} />
                      </Routes>
                    </Layout>
                  </OnboardingGate>
                </AuthGate>
              } />
            </Routes>
          </Router>
        </ReactErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
