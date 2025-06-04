
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGate } from "@/components/AuthGate";
import { NotificationErrorBoundary } from "@/components/notifications/NotificationErrorBoundary";
import { ReactErrorBoundary } from "@/components/error/ReactErrorBoundary";
import { NotificationsContext } from "@/context/NotificationsContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import Dashboard from "@/pages/Dashboard";
import CustomersPage from "@/pages/CustomersPage";
import CreateCustomer from "@/pages/CreateCustomer";
import CustomerDetails from "@/pages/CustomerDetails";
import CustomerEdit from "@/pages/CustomerEdit";
import WorkOrders from "@/pages/WorkOrders";
import WorkOrderDetails from "@/pages/WorkOrderDetails";
import WorkOrderEdit from "@/pages/WorkOrderEdit";
import Invoices from "@/pages/Invoices";
import InvoiceCreate from "@/pages/InvoiceCreate";
import InvoiceDetails from "@/pages/InvoiceDetails";
import InvoiceEdit from "@/pages/InvoiceEdit";
import Inventory from "@/pages/Inventory";
import InventoryAdd from "@/pages/InventoryAdd";
import InventoryCategories from "@/pages/InventoryCategories";
import InventoryLocations from "@/pages/InventoryLocations";
import InventorySuppliers from "@/pages/InventorySuppliers";
import InventoryOrders from "@/pages/InventoryOrders";
import InventoryManager from "@/pages/InventoryManager";
import Team from "@/pages/Team";
import TeamMemberCreate from "@/pages/TeamMemberCreate";
import TeamMemberProfile from "@/pages/TeamMemberProfile";
import TeamRoles from "@/pages/TeamRoles";
import Settings from "@/pages/Settings";
import Analytics from "@/pages/Analytics";
import Calendar from "@/pages/Calendar";
import Chat from "@/pages/Chat";
import Equipment from "@/pages/Equipment";
import EquipmentDetails from "@/pages/EquipmentDetails";
import MaintenanceDashboard from "@/pages/MaintenanceDashboard";
import RepairPlans from "@/pages/RepairPlans";
import CreateRepairPlan from "@/pages/CreateRepairPlan";
import Reminders from "@/pages/Reminders";
import Forms from "@/pages/Forms";
import FormPreview from "@/pages/FormPreview";
import Documents from "@/pages/Documents";
import Notifications from "@/pages/Notifications";
import Payments from "@/pages/Payments";
import SmsTemplates from "@/pages/SmsTemplates";
import EmailTemplates from "@/pages/EmailTemplates";
import EmailSequenceDetails from "@/pages/EmailSequenceDetails";
import VehicleInspectionForm from "@/pages/VehicleInspectionForm";
import CustomerVehicleDetails from "@/pages/CustomerVehicleDetails";
import CustomerServiceHistory from "@/pages/CustomerServiceHistory";
import CustomerPortal from "@/pages/CustomerPortal";
import CustomerPortalLogin from "@/pages/CustomerPortalLogin";
import ClientBooking from "@/pages/ClientBooking";
import ShoppingPortal from "@/pages/ShoppingPortal";
import AffiliateTool from "@/pages/AffiliateTool";
import ManufacturerPage from "@/pages/ManufacturerPage";
import Feedback from "@/pages/Feedback";
import FeedbackForm from "@/pages/FeedbackForm";
import FeedbackAnalytics from "@/pages/FeedbackAnalytics";
import Authentication from "@/pages/Authentication";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import DeveloperPortal from "@/pages/DeveloperPortal";
import OrganizationManagement from "@/pages/developer/OrganizationManagement";
import ShoppingControls from "@/pages/developer/ShoppingControls";
import ServiceManagement from "@/pages/developer/ServiceManagement";
import ServiceDataDebugPage from "@/pages/ServiceDataDebug";
import { FeedbackAnalyticsPage } from "@/pages/feedback/FeedbackAnalyticsPage";
import { FeedbackFormsPage } from "@/pages/feedback/FeedbackFormsPage";
import { FeedbackFormEditorPage } from "@/pages/feedback/FeedbackFormEditorPage";
import { AccountSettings } from "@/pages/settings/AccountSettings";
import { CompanySettings } from "@/pages/settings/CompanySettings";
import { NotificationSettings } from "@/pages/settings/NotificationSettings";
import { SecuritySettings } from "@/pages/settings/SecuritySettings";
import { IntegrationSettings } from "@/pages/settings/IntegrationSettings";
import { InventorySettings } from "@/pages/settings/InventorySettings";
import { LanguageSettings } from "@/pages/settings/LanguageSettings";
import { LoyaltySettings } from "@/pages/settings/LoyaltySettings";
import { EmailSettings } from "@/pages/settings/EmailSettings";
import { TeamHistorySettings } from "@/pages/settings/TeamHistorySettings";
import { BrandingSettings } from "@/pages/settings/BrandingSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ReactErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationsContext>
          <ImpersonationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthGate>
                <NotificationErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/create" element={<CreateCustomer />} />
                    <Route path="/customers/:id" element={<CustomerDetails />} />
                    <Route path="/customers/:id/edit" element={<CustomerEdit />} />
                    <Route path="/customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                    <Route path="/customers/:customerId/service-history" element={<CustomerServiceHistory />} />
                    <Route path="/work-orders" element={<WorkOrders />} />
                    <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                    <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/create" element={<InvoiceCreate />} />
                    <Route path="/invoices/:id" element={<InvoiceDetails />} />
                    <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/inventory/add" element={<InventoryAdd />} />
                    <Route path="/inventory/categories" element={<InventoryCategories />} />
                    <Route path="/inventory/locations" element={<InventoryLocations />} />
                    <Route path="/inventory/suppliers" element={<InventorySuppliers />} />
                    <Route path="/inventory/orders" element={<InventoryOrders />} />
                    <Route path="/inventory/manager" element={<InventoryManager />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/team/create" element={<TeamMemberCreate />} />
                    <Route path="/team/:id" element={<TeamMemberProfile />} />
                    <Route path="/team/roles" element={<TeamRoles />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/account" element={<AccountSettings />} />
                    <Route path="/settings/company" element={<CompanySettings />} />
                    <Route path="/settings/notifications" element={<NotificationSettings />} />
                    <Route path="/settings/security" element={<SecuritySettings />} />
                    <Route path="/settings/integrations" element={<IntegrationSettings />} />
                    <Route path="/settings/inventory" element={<InventorySettings />} />
                    <Route path="/settings/language" element={<LanguageSettings />} />
                    <Route path="/settings/loyalty" element={<LoyaltySettings />} />
                    <Route path="/settings/email" element={<EmailSettings />} />
                    <Route path="/settings/team-history" element={<TeamHistorySettings />} />
                    <Route path="/settings/branding" element={<BrandingSettings />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/equipment" element={<Equipment />} />
                    <Route path="/equipment/:id" element={<EquipmentDetails />} />
                    <Route path="/maintenance" element={<MaintenanceDashboard />} />
                    <Route path="/repair-plans" element={<RepairPlans />} />
                    <Route path="/repair-plans/create" element={<CreateRepairPlan />} />
                    <Route path="/reminders" element={<Reminders />} />
                    <Route path="/forms" element={<Forms />} />
                    <Route path="/forms/:id/preview" element={<FormPreview />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/sms-templates" element={<SmsTemplates />} />
                    <Route path="/email-templates" element={<EmailTemplates />} />
                    <Route path="/email-sequences/:id" element={<EmailSequenceDetails />} />
                    <Route path="/inspection/:workOrderId" element={<VehicleInspectionForm />} />
                    <Route path="/customer-portal" element={<CustomerPortal />} />
                    <Route path="/customer-portal/login" element={<CustomerPortalLogin />} />
                    <Route path="/booking/:shopId" element={<ClientBooking />} />
                    <Route path="/shopping" element={<ShoppingPortal />} />
                    <Route path="/affiliate/:category" element={<AffiliateTool />} />
                    <Route path="/manufacturer/:category/:manufacturer" element={<ManufacturerPage />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/feedback/form/:id" element={<FeedbackForm />} />
                    <Route path="/feedback/analytics/:id" element={<FeedbackAnalytics />} />
                    <Route path="/feedback/forms" element={<FeedbackFormsPage />} />
                    <Route path="/feedback/forms/:id/analytics" element={<FeedbackAnalyticsPage />} />
                    <Route path="/feedback/forms/:id/edit" element={<FeedbackFormEditorPage />} />
                    <Route path="/login" element={<Authentication />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/developer" element={<DeveloperPortal />} />
                    <Route path="/developer/organization-management" element={<OrganizationManagement />} />
                    <Route path="/developer/shopping-controls" element={<ShoppingControls />} />
                    <Route path="/developer/service-management" element={<ServiceManagement />} />
                    <Route path="/service-data-debug" element={<ServiceDataDebugPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </NotificationErrorBoundary>
              </AuthGate>
            </BrowserRouter>
          </ImpersonationProvider>
        </NotificationsContext>
      </TooltipProvider>
    </QueryClientProvider>
  </ReactErrorBoundary>
);

export default App;
