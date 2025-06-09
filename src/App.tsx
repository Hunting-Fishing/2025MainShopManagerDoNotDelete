
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { AuthGate } from '@/components/AuthGate';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { OnboardingRedirectGate } from '@/components/onboarding/OnboardingRedirectGate';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { CustomerDataProvider } from '@/contexts/CustomerDataProvider';
import { ImpersonationProvider } from '@/contexts/ImpersonationContext';
import { ReactErrorBoundary } from '@/components/error/ReactErrorBoundary';

// Import pages
import Login from '@/pages/Authentication';
import Dashboard from '@/pages/Dashboard';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import InventoryAdd from '@/pages/InventoryAdd';
import Inventory from '@/pages/Inventory';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Team from '@/pages/Team';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamRoles from '@/pages/TeamRoles';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import ShopOnboardingWizard from '@/components/onboarding/ShopOnboardingWizard';
import Calendar from '@/pages/Calendar';
import Analytics from '@/pages/Analytics';
import Reminders from '@/pages/Reminders';
import RepairPlans from '@/pages/RepairPlans';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import Forms from '@/pages/Forms';
import FormPreview from '@/pages/FormPreview';
import Notifications from '@/pages/Notifications';
import CustomerPortal from '@/pages/CustomerPortal';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import VehicleInspectionForm from '@/pages/VehicleInspectionForm';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import InventoryCategories from '@/pages/InventoryCategories';
import InventoryLocations from '@/pages/InventoryLocations';
import InventorySuppliers from '@/pages/InventorySuppliers';
import InventoryOrders from '@/pages/InventoryOrders';
import InventoryManager from '@/pages/InventoryManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <ReactErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationsProvider>
              <ImpersonationProvider>
                <CustomerDataProvider>
                  <Router>
                    <div className="App">
                      <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
                        <Route path="/customer-portal" element={<CustomerPortal />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        
                        {/* Protected routes */}
                        <Route path="/*" element={
                          <AuthGate>
                            <OnboardingRedirectGate>
                              <OnboardingGate>
                                <Routes>
                                  <Route path="/" element={<Dashboard />} />
                                  <Route path="/dashboard" element={<Dashboard />} />
                                  
                                  {/* Work Orders */}
                                  <Route path="/work-orders" element={<WorkOrders />} />
                                  <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                                  
                                  {/* Inventory */}
                                  <Route path="/inventory" element={<Inventory />} />
                                  <Route path="/inventory/add" element={<InventoryAdd />} />
                                  <Route path="/inventory/categories" element={<InventoryCategories />} />
                                  <Route path="/inventory/locations" element={<InventoryLocations />} />
                                  <Route path="/inventory/suppliers" element={<InventorySuppliers />} />
                                  <Route path="/inventory/orders" element={<InventoryOrders />} />
                                  <Route path="/inventory/manager" element={<InventoryManager />} />
                                  
                                  {/* Invoices */}
                                  <Route path="/invoices" element={<Invoices />} />
                                  <Route path="/invoices/create" element={<InvoiceCreate />} />
                                  <Route path="/invoices/:id" element={<InvoiceDetails />} />
                                  <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                                  
                                  {/* Team */}
                                  <Route path="/team" element={<Team />} />
                                  <Route path="/team/create" element={<TeamMemberCreate />} />
                                  <Route path="/team/:id" element={<TeamMemberProfile />} />
                                  <Route path="/team/roles" element={<TeamRoles />} />
                                  
                                  {/* Customers */}
                                  <Route path="/customers" element={<CustomersPage />} />
                                  <Route path="/customers/create" element={<CreateCustomer />} />
                                  <Route path="/customers/:id" element={<CustomerDetails />} />
                                  <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                                  
                                  {/* Equipment & Maintenance */}
                                  <Route path="/equipment" element={<Equipment />} />
                                  <Route path="/equipment/:id" element={<EquipmentDetails />} />
                                  <Route path="/maintenance" element={<MaintenanceDashboard />} />
                                  
                                  {/* Reports & Analytics */}
                                  <Route path="/reports" element={<Reports />} />
                                  <Route path="/analytics" element={<Analytics />} />
                                  
                                  {/* Calendar & Scheduling */}
                                  <Route path="/calendar" element={<Calendar />} />
                                  
                                  {/* Reminders & Repair Plans */}
                                  <Route path="/reminders" element={<Reminders />} />
                                  <Route path="/repair-plans" element={<RepairPlans />} />
                                  <Route path="/repair-plans/create" element={<CreateRepairPlan />} />
                                  
                                  {/* Forms & Inspections */}
                                  <Route path="/forms" element={<Forms />} />
                                  <Route path="/forms/:id/preview" element={<FormPreview />} />
                                  <Route path="/vehicle-inspection" element={<VehicleInspectionForm />} />
                                  
                                  {/* Notifications */}
                                  <Route path="/notifications" element={<Notifications />} />
                                  
                                  {/* Settings */}
                                  <Route path="/settings/*" element={<Settings />} />
                                  
                                  {/* Onboarding */}
                                  <Route path="/onboarding" element={<ShopOnboardingWizard />} />
                                  
                                  {/* 404 */}
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </OnboardingGate>
                            </OnboardingRedirectGate>
                          </AuthGate>
                        } />
                      </Routes>
                      <Toaster />
                    </div>
                  </Router>
                </CustomerDataProvider>
              </ImpersonationProvider>
            </NotificationsProvider>
          </LanguageProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReactErrorBoundary>
  );
}

export default App;
