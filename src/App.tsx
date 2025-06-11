
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster as RadixToaster } from '@/components/ui/toaster';
import { AuthGate } from '@/components/AuthGate';
import { Layout } from '@/components/layout/Layout';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { ReactErrorBoundary } from '@/components/error/ReactErrorBoundary';
import { CustomerDataProvider } from '@/contexts/CustomerDataProvider';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const WorkOrders = React.lazy(() => import('@/pages/WorkOrders'));
const WorkOrderDetails = React.lazy(() => import('@/pages/WorkOrderDetails'));
const WorkOrderEdit = React.lazy(() => import('@/pages/WorkOrderEdit'));
const WorkOrderCreate = React.lazy(() => import('@/pages/WorkOrderCreate'));
const Customers = React.lazy(() => import('@/pages/Customers'));
const CustomerDetails = React.lazy(() => import('@/pages/CustomerDetails'));
const CustomerCreate = React.lazy(() => import('@/pages/CustomerCreate'));
const CustomerEdit = React.lazy(() => import('@/pages/CustomerEdit'));
const VehicleDetails = React.lazy(() => import('@/pages/VehicleDetails'));
const Inventory = React.lazy(() => import('@/pages/Inventory'));
const InventoryAdd = React.lazy(() => import('@/pages/InventoryAdd'));
const InventoryEdit = React.lazy(() => import('@/pages/InventoryEdit'));
const Invoices = React.lazy(() => import('@/pages/Invoices'));
const InvoiceDetails = React.lazy(() => import('@/pages/InvoiceDetails'));
const InvoiceCreate = React.lazy(() => import('@/pages/InvoiceCreate'));
const InvoiceEdit = React.lazy(() => import('@/pages/InvoiceEdit'));
const Equipment = React.lazy(() => import('@/pages/Equipment'));
const EquipmentDetails = React.lazy(() => import('@/pages/EquipmentDetails'));
const Team = React.lazy(() => import('@/pages/Team'));
const TeamMemberDetails = React.lazy(() => import('@/pages/TeamMemberDetails'));
const TeamCreate = React.lazy(() => import('@/pages/TeamCreate'));
const TeamRoles = React.lazy(() => import('@/pages/TeamRoles'));
const Calendar = React.lazy(() => import('@/pages/Calendar'));
const Quotes = React.lazy(() => import('@/pages/Quotes'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Maintenance = React.lazy(() => import('@/pages/Maintenance'));
const MaintenanceScheduler = React.lazy(() => import('@/pages/MaintenanceScheduler'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const Forms = React.lazy(() => import('@/pages/Forms'));
const Feedback = React.lazy(() => import('@/pages/Feedback'));
const FeedbackForm = React.lazy(() => import('@/pages/FeedbackForm'));
const FeedbackAnalytics = React.lazy(() => import('@/pages/FeedbackAnalytics'));
const Reminders = React.lazy(() => import('@/pages/Reminders'));
const CustomerPortal = React.lazy(() => import('@/pages/CustomerPortal'));
const Shopping = React.lazy(() => import('@/pages/Shopping'));
const Developer = React.lazy(() => import('@/pages/Developer'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  return (
    <ReactErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <LanguageProvider>
            <NotificationsProvider>
              <CustomerDataProvider>
                <ImpersonationProvider>
                  <AuthGate>
                    <OnboardingGate>
                      <Layout>
                        <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>}>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/work-orders" element={<WorkOrders />} />
                            <Route path="/work-orders/create" element={<WorkOrderCreate />} />
                            <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                            <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/customers/create" element={<CustomerCreate />} />
                            <Route path="/customers/:id" element={<CustomerDetails />} />
                            <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                            <Route path="/customers/:customerId/vehicles/:vehicleId" element={<VehicleDetails />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/inventory/add" element={<InventoryAdd />} />
                            <Route path="/inventory/:id/edit" element={<InventoryEdit />} />
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/invoices/create" element={<InvoiceCreate />} />
                            <Route path="/invoices/:id" element={<InvoiceDetails />} />
                            <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                            <Route path="/equipment" element={<Equipment />} />
                            <Route path="/equipment/:id" element={<EquipmentDetails />} />
                            <Route path="/team" element={<Team />} />
                            <Route path="/team/create" element={<TeamCreate />} />
                            <Route path="/team/roles" element={<TeamRoles />} />
                            <Route path="/team/:id" element={<TeamMemberDetails />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/quotes" element={<Quotes />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/maintenance" element={<Maintenance />} />
                            <Route path="/maintenance/scheduler" element={<MaintenanceScheduler />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/forms" element={<Forms />} />
                            <Route path="/feedback" element={<Feedback />} />
                            <Route path="/feedback/form/:id" element={<FeedbackForm />} />
                            <Route path="/feedback/analytics/:id" element={<FeedbackAnalytics />} />
                            <Route path="/reminders" element={<Reminders />} />
                            <Route path="/customer-portal" element={<CustomerPortal />} />
                            <Route path="/shopping" element={<Shopping />} />
                            <Route path="/developer" element={<Developer />} />
                          </Routes>
                        </React.Suspense>
                      </Layout>
                    </OnboardingGate>
                  </AuthGate>
                </ImpersonationProvider>
              </CustomerDataProvider>
            </NotificationsProvider>
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
      <Toaster />
      <RadixToaster />
    </ReactErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
