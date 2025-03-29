
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Index from "@/pages/Index";
import WorkOrders from "@/pages/WorkOrders";
import WorkOrderCreate from "@/pages/WorkOrderCreate";
import WorkOrderDetails from "@/pages/WorkOrderDetails";
import Customers from "@/pages/Customers";
import CustomerDetails from "@/pages/CustomerDetails";
import CustomerServiceHistory from "@/pages/CustomerServiceHistory";
import Invoices from "@/pages/Invoices";
import InvoiceCreate from "@/pages/InvoiceCreate";
import InvoiceDetails from "@/pages/InvoiceDetails";
import Calendar from "@/pages/Calendar";
import NotFound from "@/pages/NotFound";
import Inventory from "@/pages/Inventory";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Team from "@/pages/Team";
import TeamMemberProfile from "@/pages/TeamMemberProfile";
import TeamMemberCreate from "@/pages/TeamMemberCreate";
import TeamRoles from "@/pages/TeamRoles";
import Equipment from "@/pages/Equipment";
import EquipmentDetails from "@/pages/EquipmentDetails";
import CustomerFollowUps from "@/pages/CustomerFollowUps";
import Reports from "@/pages/Reports";
import MaintenanceDashboard from "@/pages/MaintenanceDashboard";
import { Toaster } from "@/components/ui/toaster";
import { GlobalCommandMenu } from "@/components/search/GlobalCommandMenu";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  
  const handleCommandSearch = (value: string) => {
    console.log("Searching for:", value);
  };
  
  // Setup keyboard shortcut for command menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandMenuOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <GlobalCommandMenu 
        open={commandMenuOpen} 
        onOpenChange={setCommandMenuOpen} 
        onSearch={handleCommandSearch}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="work-orders/new" element={<WorkOrderCreate />} />
          <Route path="work-orders/:id" element={<WorkOrderDetails />} />
          <Route path="work-orders/:id/edit" element={<WorkOrderDetails edit={true} />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="customers/:id/service-history" element={<CustomerServiceHistory />} />
          <Route path="customers/follow-ups" element={<CustomerFollowUps />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<InvoiceCreate />} />
          <Route path="invoices/new/:workOrderId" element={<InvoiceCreate />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="equipment/:id" element={<EquipmentDetails />} />
          <Route path="maintenance" element={<MaintenanceDashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="reports" element={<Reports />} />
          <Route path="team" element={<Team />} />
          <Route path="team/members/:id" element={<TeamMemberProfile />} />
          <Route path="team/members/new" element={<TeamMemberCreate />} />
          <Route path="team/roles" element={<TeamRoles />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
