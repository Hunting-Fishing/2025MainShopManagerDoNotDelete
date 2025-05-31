
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactErrorBoundary } from "@/components/error/ReactErrorBoundary";
import AuthGate from "@/components/AuthGate";
import Layout from "@/components/layout/Layout";
import { ShopOnboardingWizard } from "@/components/onboarding/ShopOnboardingWizard";

// Pages
import Dashboard from "@/pages/Dashboard";
import CustomersPage from "@/pages/CustomersPage";
import WorkOrders from "@/pages/WorkOrders";
import WorkOrderCreate from "@/pages/WorkOrderCreate";
import Inventory from "@/pages/Inventory";
import InventoryAdd from "@/pages/InventoryAdd";
import Invoices from "@/pages/Invoices";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Calendar from "@/pages/Calendar";
import Equipment from "@/pages/Equipment";
import CustomerDetails from "@/pages/CustomerDetails";
import WorkOrderDetails from "@/pages/WorkOrderDetails";
import InvoiceDetails from "@/pages/InvoiceDetails";
import CreateInvoice from "@/pages/CreateInvoice";
import CreateCustomer from "@/pages/CreateCustomer";
import EquipmentDetails from "@/pages/EquipmentDetails";
import VehicleDetails from "@/pages/VehicleDetails";
import Maintenance from "@/pages/Maintenance";
import Analytics from "@/pages/Analytics";
import Feedback from "@/pages/Feedback";
import Forms from "@/pages/Forms";
import Notifications from "@/pages/Notifications";
import CustomerPortal from "@/pages/CustomerPortal";
import Chat from "@/pages/Chat";

// Developer Pages
import DeveloperPortal from "@/pages/DeveloperPortal";
import OrganizationManagement from "@/pages/developer/OrganizationManagement";
import ShoppingControls from "@/pages/developer/ShoppingControls";
import ServiceManagement from "@/pages/developer/ServiceManagement";

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
              
              {/* Onboarding Routes - Auth Required */}
              <Route path="/onboarding" element={
                <AuthGate>
                  <ShopOnboardingWizard />
                </AuthGate>
              } />
              
              {/* Protected Main App Routes with OnboardingGate */}
              <Route path="/*" element={
                <AuthGate>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/customers" element={<CustomersPage />} />
                      <Route path="/customers/new" element={<CreateCustomer />} />
                      <Route path="/customers/:id" element={<CustomerDetails />} />
                      <Route path="/customers/:customerId/vehicles/:vehicleId" element={<VehicleDetails />} />
                      <Route path="/work-orders" element={<WorkOrders />} />
                      <Route path="/work-orders/create" element={<WorkOrderCreate />} />
                      <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/inventory/add" element={<InventoryAdd />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/invoices/new" element={<CreateInvoice />} />
                      <Route path="/invoices/:id" element={<InvoiceDetails />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/equipment/:id" element={<EquipmentDetails />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/feedback" element={<Feedback />} />
                      <Route path="/forms" element={<Forms />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/chat" element={<Chat />} />
                      
                      {/* Developer Portal Routes */}
                      <Route path="/developer" element={<DeveloperPortal />} />
                      <Route path="/developer/organization-management" element={<OrganizationManagement />} />
                      <Route path="/developer/shopping-controls" element={<ShoppingControls />} />
                      <Route path="/developer/service-management" element={<ServiceManagement />} />
                    </Routes>
                  </Layout>
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
