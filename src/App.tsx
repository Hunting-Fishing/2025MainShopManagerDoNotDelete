
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import WorkOrders from "@/pages/WorkOrders";
import WorkOrderCreate from "@/pages/WorkOrderCreate";
import WorkOrderDetails from "@/pages/WorkOrderDetails";
import Inventory from "@/pages/Inventory";
import Team from "@/pages/Team";
import Invoices from "@/pages/Invoices";
import InvoiceDetails from "@/pages/InvoiceDetails";
import InvoiceCreate from "@/pages/InvoiceCreate";
import Reports from "@/pages/Reports";
import Calendar from "@/pages/Calendar";
import Equipment from "@/pages/Equipment";
import EquipmentDetails from "@/pages/EquipmentDetails";
import Customers from "@/pages/Customers";
import CustomerDetails from "@/pages/CustomerDetails";
import CustomerServiceHistory from "@/pages/CustomerServiceHistory";
import NotFound from "@/pages/NotFound";
import "./styles/workOrders.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/work-orders" element={<Layout><WorkOrders /></Layout>} />
          <Route path="/work-orders/new" element={<Layout><WorkOrderCreate /></Layout>} />
          <Route path="/work-orders/:id" element={<Layout><WorkOrderDetails /></Layout>} />
          <Route path="/work-orders/:id/edit" element={<Layout><WorkOrderDetails edit /></Layout>} />
          <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
          <Route path="/invoices/:id" element={<Layout><InvoiceDetails /></Layout>} />
          <Route path="/invoices/new" element={<Layout><InvoiceCreate /></Layout>} />
          <Route path="/invoices/from-work-order/:workOrderId" element={<Layout><InvoiceCreate /></Layout>} />
          <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
          <Route path="/equipment" element={<Layout><Equipment /></Layout>} />
          <Route path="/equipment/:id" element={<Layout><EquipmentDetails /></Layout>} />
          <Route path="/customers" element={<Layout><Customers /></Layout>} />
          <Route path="/customers/:id" element={<Layout><CustomerDetails /></Layout>} />
          <Route path="/customer-service-history/:customer" element={<Layout><CustomerServiceHistory /></Layout>} />
          <Route path="/team" element={<Layout><Team /></Layout>} />
          <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
