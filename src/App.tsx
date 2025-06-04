import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConsoleErrorLogger } from "@/components/debug/ConsoleErrorLogger";
import { ExtensionConflictDetector } from "@/components/debug/ExtensionConflictDetector";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Inventory from "./pages/Inventory";
import WorkOrders from "./pages/WorkOrders";
import WorkOrderDetails from "./pages/WorkOrderDetails";
import Invoices from "./pages/Invoices";
import InvoiceDetails from "./pages/InvoiceDetails";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Developer from "./pages/Developer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { AuthProvider } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext";
import { CustomerProvider } from "./context/CustomerContext";
import { WorkOrderProvider } from "./context/WorkOrderContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { TeamProvider } from "./context/TeamContext";
import { SettingsProvider } from "./context/SettingsContext";
import { DashboardProvider } from "./context/DashboardContext";
import NewCustomer from "./pages/NewCustomer";
import EditCustomer from "./pages/EditCustomer";
import NewWorkOrder from "./pages/NewWorkOrder";
import EditWorkOrder from "./pages/EditWorkOrder";
import NewInvoice from "./pages/NewInvoice";
import EditInvoice from "./pages/EditInvoice";
import NewTeamMember from "./pages/NewTeamMember";
import EditTeamMember from "./pages/EditTeamMember";
import ServiceDataDebugPage from "./pages/ServiceDataDebug";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <ConsoleErrorLogger />
          <ExtensionConflictDetector />
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

                <Route path="/dashboard" element={<ProtectedRoute><DashboardProvider><Dashboard /></DashboardProvider></ProtectedRoute>} />

                <Route path="/customers" element={<ProtectedRoute><CustomerProvider><Customers /></CustomerProvider></ProtectedRoute>} />
                <Route path="/customers/create" element={<ProtectedRoute><CustomerProvider><NewCustomer /></CustomerProvider></ProtectedRoute>} />
                <Route path="/customers/:id" element={<ProtectedRoute><CustomerProvider><CustomerDetails /></CustomerProvider></ProtectedRoute>} />
                <Route path="/customers/:id/edit" element={<ProtectedRoute><CustomerProvider><EditCustomer /></CustomerProvider></ProtectedRoute>} />

                <Route path="/inventory" element={<ProtectedRoute><InventoryProvider><Inventory /></InventoryProvider></ProtectedRoute>} />

                <Route path="/work-orders" element={<ProtectedRoute><WorkOrderProvider><WorkOrders /></WorkOrderProvider></ProtectedRoute>} />
                <Route path="/work-orders/create" element={<ProtectedRoute><WorkOrderProvider><NewWorkOrder /></WorkOrderProvider></ProtectedRoute>} />
                <Route path="/work-orders/:id" element={<ProtectedRoute><WorkOrderProvider><WorkOrderDetails /></WorkOrderProvider></ProtectedRoute>} />
                <Route path="/work-orders/:id/edit" element={<ProtectedRoute><WorkOrderProvider><EditWorkOrder /></WorkOrderProvider></ProtectedRoute>} />

                <Route path="/invoices" element={<ProtectedRoute><InvoiceProvider><Invoices /></InvoiceProvider></ProtectedRoute>} />
                <Route path="/invoices/create" element={<ProtectedRoute><InvoiceProvider><NewInvoice /></InvoiceProvider></ProtectedRoute>} />
                <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceProvider><InvoiceDetails /></InvoiceProvider></ProtectedRoute>} />
                <Route path="/invoices/:id/edit" element={<ProtectedRoute><InvoiceProvider><EditInvoice /></InvoiceProvider></ProtectedRoute>} />

                <Route path="/team" element={<ProtectedRoute><TeamProvider><Team /></TeamProvider></ProtectedRoute>} />
                <Route path="/team/create" element={<ProtectedRoute><TeamProvider><NewTeamMember /></TeamProvider></ProtectedRoute>} />
                <Route path="/team/:id/edit" element={<ProtectedRoute><TeamProvider><EditTeamMember /></TeamProvider></ProtectedRoute>} />

                <Route path="/settings" element={<ProtectedRoute><SettingsProvider><Settings /></SettingsProvider></ProtectedRoute>} />

                <Route path="/developer" element={<ProtectedRoute><Developer /></ProtectedRoute>} />
                <Route path="/service-data-debug" element={<ServiceDataDebugPage />} />
              </Routes>
            </main>
          </div>
          <Toaster />
          <Sonner />
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
