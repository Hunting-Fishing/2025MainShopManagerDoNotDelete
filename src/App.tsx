
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import WorkOrders from './pages/WorkOrders';
import WorkOrderCreate from './pages/WorkOrderCreate';
import WorkOrderDetails from './pages/WorkOrderDetails';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import CustomerServiceHistory from './pages/CustomerServiceHistory';
import CustomerFollowUps from './pages/CustomerFollowUps';
import Equipment from './pages/Equipment';
import EquipmentDetails from './pages/EquipmentDetails';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceDetails from './pages/InvoiceDetails';
import Team from './pages/Team';
import TeamMemberCreate from './pages/TeamMemberCreate';
import TeamRoles from './pages/TeamRoles';
import TeamMemberProfile from './pages/TeamMemberProfile';
import MaintenanceDashboard from './pages/MaintenanceDashboard';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster"
import Analytics from './pages/Analytics';
import RepairPlanDetails from './pages/RepairPlanDetails';
import RepairPlans from './pages/RepairPlans';
import Index from './pages/Index';
import CustomerCreate from './pages/CustomerCreate';
import CreateRepairPlan from './pages/CreateRepairPlan';
// Add feedback pages imports
import FeedbackFormsPage from './pages/feedback/FeedbackFormsPage';
import FeedbackFormEditorPage from './pages/feedback/FeedbackFormEditorPage';
import FeedbackAnalyticsPage from './pages/feedback/FeedbackAnalyticsPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="work-orders" element={<WorkOrders />} />
            <Route path="work-orders/new" element={<WorkOrderCreate />} />
            <Route path="work-orders/:id" element={<WorkOrderDetails />} />
            <Route path="work-orders/:id/edit" element={<WorkOrderCreate />} />
            <Route path="work-orders/:id/chat" element={<Chat />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceCreate />} />
            <Route path="invoices/:id" element={<InvoiceDetails />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/new" element={<CustomerCreate />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="customers/:id/service-history" element={<CustomerServiceHistory />} />
            <Route path="customers/follow-ups" element={<CustomerFollowUps />} />
            <Route path="repair-plans" element={<RepairPlans />} />
            <Route path="repair-plans/new" element={<CreateRepairPlan />} />
            <Route path="repair-plans/:id" element={<RepairPlanDetails />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="equipment/:id" element={<EquipmentDetails />} />
            <Route path="maintenance" element={<MaintenanceDashboard />} />
            <Route path="team" element={<Team />} />
            <Route path="team/roles" element={<TeamRoles />} />
            <Route path="team/new" element={<TeamMemberCreate />} />
            <Route path="team/:id" element={<TeamMemberProfile />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
            {/* Feedback Routes */}
            <Route path="feedback/forms" element={<FeedbackFormsPage />} />
            <Route path="feedback/forms/new" element={<FeedbackFormEditorPage />} />
            <Route path="feedback/forms/:formId/edit" element={<FeedbackFormEditorPage />} />
            <Route path="feedback/forms/:formId/analytics" element={<FeedbackAnalyticsPage />} />
            <Route path="settings/*" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
