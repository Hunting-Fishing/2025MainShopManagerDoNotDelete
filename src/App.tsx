import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { AuthGate } from '@/components/AuthGate';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { Layout } from '@/components/layout/Layout';

// Import pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import CustomersPage from '@/pages/CustomersPage';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerEdit from '@/pages/CustomerEdit';
import WorkOrdersPage from '@/pages/WorkOrdersPage';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import Invoices from '@/pages/Invoices';
import InvoiceCreate from '@/pages/InvoiceCreate';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import Team from '@/pages/Team';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamRoles from '@/pages/TeamRoles';
import Reports from '@/pages/Reports';
import Calendar from '@/pages/Calendar';
import ServiceReminders from '@/pages/ServiceReminders';
import Analytics from '@/pages/Analytics';
import Notifications from '@/pages/Notifications';
import Chat from '@/pages/Chat';
import CompanySettings from '@/pages/settings/CompanySettings';
import AccountSettings from '@/pages/settings/AccountSettings';
import NotificationSettings from '@/pages/settings/NotificationSettings';
import BrandingSettings from '@/pages/settings/BrandingSettings';
import LanguageSettings from '@/pages/settings/LanguageSettings';
import LoyaltySettings from '@/pages/settings/LoyaltySettings';
import LabourSettings from '@/pages/settings/LabourSettings';
import MarkupSettings from '@/pages/settings/MarkupSettings';
import InventorySettings from '@/pages/settings/InventorySettings';
import EmailSettings from '@/pages/settings/EmailSettings';
import EmailSchedulingSettings from '@/pages/settings/EmailSchedulingSettings';
import IntegrationSettings from '@/pages/settings/IntegrationSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import SecurityAdvancedSettings from '@/pages/settings/SecurityAdvancedSettings';
import DataExportSettings from '@/pages/settings/DataExportSettings';
import TeamHistorySettings from '@/pages/settings/TeamHistorySettings';
import AppearanceSettings from '@/pages/settings/AppearanceSettings';
import ErrorPage from '@/pages/error-page';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Index />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <AuthGate>
              <OnboardingGate>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Customer routes */}
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/create" element={<CreateCustomer />} />
                    <Route path="/customers/:id" element={<CustomerDetails />} />
                    <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                    
                    {/* Work Order routes */}
                    <Route path="/work-orders" element={<WorkOrdersPage />} />
                    <Route path="/work-orders/create" element={<WorkOrderCreate />} />
                    <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                    <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />
                    
                    {/* Invoice routes */}
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/create" element={<InvoiceCreate />} />
                    <Route path="/invoices/:id" element={<InvoiceDetails />} />
                    <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                    
                    {/* Inventory routes */}
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/inventory/add" element={<InventoryAdd />} />
                    
                    {/* Team routes */}
                    <Route path="/team" element={<Team />} />
                    <Route path="/team/create" element={<TeamMemberCreate />} />
                    <Route path="/team/:id" element={<TeamMemberProfile />} />
                    <Route path="/team/roles" element={<TeamRoles />} />
                    
                    {/* Other main routes */}
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/reminders" element={<ServiceReminders />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/chat" element={<Chat />} />
                    
                    {/* Settings routes */}
                    <Route path="/settings/company" element={<CompanySettings />} />
                    <Route path="/settings/account" element={<AccountSettings />} />
                    <Route path="/settings/notifications" element={<NotificationSettings />} />
                    <Route path="/settings/branding" element={<BrandingSettings />} />
                    <Route path="/settings/language" element={<LanguageSettings />} />
                    <Route path="/settings/loyalty" element={<LoyaltySettings />} />
                    <Route path="/settings/labour" element={<LabourSettings />} />
                    <Route path="/settings/markup" element={<MarkupSettings />} />
                    <Route path="/settings/inventory" element={<InventorySettings />} />
                    <Route path="/settings/email" element={<EmailSettings />} />
                    <Route path="/settings/email-scheduling" element={<EmailSchedulingSettings />} />
                    <Route path="/settings/integrations" element={<IntegrationSettings />} />
                    <Route path="/settings/security" element={<SecuritySettings />} />
                    <Route path="/settings/security-advanced" element={<SecurityAdvancedSettings />} />
                    <Route path="/settings/data-export" element={<DataExportSettings />} />
                    <Route path="/settings/team-history" element={<TeamHistorySettings />} />
                    <Route path="/settings/appearance" element={<AppearanceSettings />} />
                    
                    {/* Fallback routes */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </OnboardingGate>
            </AuthGate>
          } />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
