
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CreateCustomer from '@/pages/CreateCustomer';
import CustomerDetails from '@/pages/CustomerDetails';
import EditCustomer from '@/pages/EditCustomer';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import Invoices from '@/pages/Invoices';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceCreate from '@/pages/InvoiceCreate';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import RepairPlans from '@/pages/RepairPlans';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import RepairPlanDetails from '@/pages/RepairPlanDetails';
import Team from '@/pages/Team';
import TeamMemberProfile from '@/pages/TeamMemberProfile';
import TeamMemberCreate from '@/pages/TeamMemberCreate';
import TeamRoles from '@/pages/TeamRoles';
import Equipment from '@/pages/Equipment';
import EquipmentDetails from '@/pages/EquipmentDetails';
import Calendar from '@/pages/Calendar';
import Reminders from '@/pages/Reminders';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Analytics from '@/pages/Analytics';
import CustomerAnalytics from '@/pages/CustomerAnalytics';
import CustomerServiceHistory from '@/pages/CustomerServiceHistory';
import CustomerFollowUps from '@/pages/CustomerFollowUps';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import ServiceReminders from '@/pages/ServiceReminders';
import EmailTemplates from '@/pages/EmailTemplates';
import EmailCampaigns from '@/pages/EmailCampaigns';
import EmailSequences from '@/pages/EmailSequences';
import EmailSequenceDetails from '@/pages/EmailSequenceDetails';
import SmsManagement from '@/pages/SmsManagement';
import SmsTemplates from '@/pages/SmsTemplates';
import CreateWorkOrder from '@/pages/CreateWorkOrder';
import CreateInvoice from '@/pages/CreateInvoice';
import Maintenance from '@/pages/Maintenance';
import Chat from '@/pages/Chat';
import FeedbackFormsPage from '@/pages/feedback/FeedbackFormsPage';
import FeedbackFormEditorPage from '@/pages/feedback/FeedbackFormEditorPage';
import FeedbackAnalyticsPage from '@/pages/feedback/FeedbackAnalyticsPage';
import EmailCampaignAnalytics from "./pages/EmailCampaignAnalytics";
import Shopping from './pages/Shopping';
import ShoppingAdmin from './pages/ShoppingAdmin';
import Login from './pages/Login';
import Index from './pages/Index';
import { useEffect, useState } from 'react';
import { supabase } from './integrations/supabase/client';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check current auth status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        
        {/* Protected routes */}
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/create" element={<CreateCustomer />} />
          <Route path="customers/new" element={<CreateCustomer />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="customers/:id/edit" element={<EditCustomer />} />
          <Route path="customers/:id/service-history" element={<CustomerServiceHistory />} />
          <Route path="customers/:id/follow-ups" element={<CustomerFollowUps />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="work-orders/create" element={<WorkOrderCreate />} />
          <Route path="work-orders/new" element={<CreateWorkOrder />} />
          <Route path="work-orders/:id" element={<WorkOrderDetails />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/create" element={<InvoiceCreate />} />
          <Route path="invoices/new" element={<CreateInvoice />} />
          <Route path="invoices/:id" element={<InvoiceDetails />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/add" element={<InventoryAdd />} />
          <Route path="repair-plans" element={<RepairPlans />} />
          <Route path="repair-plans/create" element={<CreateRepairPlan />} />
          <Route path="repair-plans/:id" element={<RepairPlanDetails />} />
          <Route path="team" element={<Team />} />
          <Route path="team/roles" element={<TeamRoles />} />
          <Route path="team/create" element={<TeamMemberCreate />} />
          <Route path="team/:id" element={<TeamMemberProfile />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="equipment/:id" element={<EquipmentDetails />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings/*" element={<Settings />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="customer-analytics" element={<CustomerAnalytics />} />
          <Route path="maintenance" element={<MaintenanceDashboard />} />
          <Route path="maintenance/dashboard" element={<Maintenance />} />
          <Route path="service-reminders" element={<ServiceReminders />} />
          <Route path="email-templates" element={<EmailTemplates />} />
          <Route path="email-campaigns" element={<EmailCampaigns />} />
          <Route path="email-sequences" element={<EmailSequences />} />
          <Route path="email-sequences/:id" element={<EmailSequenceDetails />} />
          <Route path="sms" element={<SmsManagement />} />
          <Route path="sms-templates" element={<SmsTemplates />} />
          <Route path="chat" element={<Chat />} />
          <Route path="shopping" element={<Shopping />} />
          <Route path="shopping/admin" element={<ShoppingAdmin />} />
          <Route path="feedback/forms" element={<FeedbackFormsPage />} />
          <Route path="feedback/forms/editor/:id?" element={<FeedbackFormEditorPage />} />
          <Route path="feedback/analytics/:id" element={<FeedbackAnalyticsPage />} />
          <Route path="/email-campaigns/:id/analytics" element={<EmailCampaignAnalytics />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
