
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import WorkOrders from './pages/WorkOrders';
import Invoices from './pages/Invoices';
import Customers from './pages/Customers';
import Equipment from './pages/Equipment';
import Inventory from './pages/Inventory';
import Forms from './pages/Forms';
import Maintenance from './pages/Maintenance';
import Calendar from './pages/Calendar';
import Reminders from './pages/ServiceReminders';
import Chat from './pages/Chat';
import Shopping from './pages/Shopping';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import WorkOrderCreate from './pages/WorkOrderCreate';
import WorkOrderDetails from './pages/WorkOrderDetails';
import CustomerDetails from './pages/CustomerDetails';
import CreateCustomer from './pages/CreateCustomer';
import EditCustomer from './pages/EditCustomer';
import VehicleDetails from './pages/VehicleDetails';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceDetails from './pages/InvoiceDetails';
import CustomerServiceHistory from './pages/CustomerServiceHistory';
import CustomerFollowUps from './pages/CustomerFollowUps';
import CustomerAnalytics from './pages/CustomerAnalytics';
import RepairPlans from './pages/RepairPlans';
import RepairPlanDetails from './pages/RepairPlanDetails';
import CreateRepairPlan from './pages/CreateRepairPlan';
import TeamMemberProfile from './pages/TeamMemberProfile';
import TeamRoles from './pages/TeamRoles';
import TeamMemberCreate from './pages/TeamMemberCreate';
import EquipmentDetails from './pages/EquipmentDetails';
import InventoryAdd from './pages/InventoryAdd';
import MaintenanceDashboard from './pages/MaintenanceDashboard';
import Analytics from './pages/Analytics';
import EmailTemplates from './pages/EmailTemplates';
import EmailCampaigns from './pages/EmailCampaigns';
import EmailCampaignAnalytics from './pages/EmailCampaignAnalytics';
import EmailSequences from './pages/EmailSequences';
import EmailSequenceDetails from './pages/EmailSequenceDetails';
import SmsTemplates from './pages/SmsTemplates';
import SmsManagement from './pages/SmsManagement';
import ShoppingAdmin from './pages/ShoppingAdmin';
import FormPreview from './pages/FormPreview';
import FormEditor from './pages/FormEditor';
import FormBuilder from './pages/FormBuilder';
import VehicleInspectionForm from './pages/VehicleInspectionForm';

import FeedbackFormsPage from './pages/feedback/FeedbackFormsPage';
import FeedbackFormEditorPage from './pages/feedback/FeedbackFormEditorPage';
import FeedbackAnalyticsPage from './pages/feedback/FeedbackAnalyticsPage';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationsProvider } from '@/context/notifications';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationsProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="work-orders" element={<WorkOrders />} />
                <Route path="work-orders/create" element={<WorkOrderCreate />} />
                <Route path="work-orders/:id" element={<WorkOrderDetails />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/create" element={<InvoiceCreate />} />
                <Route path="invoices/:id" element={<InvoiceDetails />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/create" element={<CreateCustomer />} />
                <Route path="customers/:id" element={<CustomerDetails />} />
                <Route path="customers/:id/edit" element={<EditCustomer />} />
                <Route path="customers/:id/service-history" element={<CustomerServiceHistory />} />
                <Route path="customers/:id/follow-ups" element={<CustomerFollowUps />} />
                <Route path="customers/:id/analytics" element={<CustomerAnalytics />} />
                <Route path="customers/:id/vehicles/:vehicleId" element={<VehicleDetails />} />
                <Route path="equipment" element={<Equipment />} />
                <Route path="equipment/:id" element={<EquipmentDetails />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventory/add" element={<InventoryAdd />} />
                <Route path="forms" element={<Forms />} />
                <Route path="forms/create" element={<FormBuilder />} />
                <Route path="forms/:id" element={<FormPreview />} />
                <Route path="forms/:id/edit" element={<FormEditor />} />
                <Route path="vehicle-inspection" element={<VehicleInspectionForm />} />
                <Route path="maintenance" element={<Maintenance />} />
                <Route path="maintenance/dashboard" element={<MaintenanceDashboard />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="reminders" element={<Reminders />} />
                <Route path="chat" element={<Chat />} />
                <Route path="shopping" element={<Shopping />} />
                <Route path="shopping/admin" element={<ShoppingAdmin />} />
                <Route path="reports" element={<Reports />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="team" element={<Team />} />
                <Route path="team/create" element={<TeamMemberCreate />} />
                <Route path="team/roles" element={<TeamRoles />} />
                <Route path="team/:id" element={<TeamMemberProfile />} />
                <Route path="marketing/email-templates" element={<EmailTemplates />} />
                <Route path="marketing/email-campaigns" element={<EmailCampaigns />} />
                <Route path="marketing/email-campaigns/:id" element={<EmailCampaignAnalytics />} />
                <Route path="marketing/email-sequences" element={<EmailSequences />} />
                <Route path="marketing/email-sequences/:id" element={<EmailSequenceDetails />} />
                <Route path="marketing/sms-templates" element={<SmsTemplates />} />
                <Route path="marketing/sms-management" element={<SmsManagement />} />
                <Route path="repair-plans" element={<RepairPlans />} />
                <Route path="repair-plans/create" element={<CreateRepairPlan />} />
                <Route path="repair-plans/:id" element={<RepairPlanDetails />} />
                <Route path="feedback" element={<FeedbackFormsPage />} />
                <Route path="feedback/:id/editor" element={<FeedbackFormEditorPage />} />
                <Route path="feedback/:id/analytics" element={<FeedbackAnalyticsPage />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </NotificationsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
