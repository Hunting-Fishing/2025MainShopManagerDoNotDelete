
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import NotFound from '@/pages/NotFound';
import WorkOrdersPage from '@/pages/WorkOrdersPage';
import WorkOrderDetail from '@/pages/WorkOrderDetail';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import Invoices from '@/pages/Invoices';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CreateCustomer from '@/pages/CreateCustomer';
import EditCustomer from '@/pages/EditCustomer';
import Team from '@/pages/Team';
import CreateTeamMember from '@/pages/CreateTeamMember';
import Chat from '@/pages/Chat';
import Calendar from '@/pages/Calendar';
import Analytics from '@/pages/Analytics';
import EmailTemplates from '@/pages/EmailTemplates';
import EmailSequenceDetails from '@/pages/EmailSequenceDetails';
import CreateRepairPlan from '@/pages/CreateRepairPlan';
import Inventory from '@/pages/Inventory';
import Maintenance from '@/pages/Maintenance';
import MaintenanceDashboard from '@/pages/MaintenanceDashboard';
import Forms from '@/pages/Forms';
import Shopping from '@/pages/Shopping';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import ServiceReminders from '@/pages/ServiceReminders';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Work Orders */}
        <Route path="/work-orders" element={<WorkOrdersPage />} />
        <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
        <Route path="/work-orders/new" element={<WorkOrderCreate />} />
        <Route path="/work-orders/:id/edit" element={<WorkOrderCreate />} />
        
        {/* Customers */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/new" element={<CreateCustomer />} />
        <Route path="/customers/:customerId/edit" element={<EditCustomer />} />
        
        {/* Invoices */}
        <Route path="/invoices" element={<Invoices />} />
        
        {/* Team */}
        <Route path="/team" element={<Team />} />
        <Route path="/team/create" element={<CreateTeamMember />} />
        
        {/* Calendar */}
        <Route path="/calendar" element={<Calendar />} />
        
        {/* Chat */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:roomId" element={<Chat />} />
        
        {/* Reports & Analytics */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Marketing */}
        <Route path="/email-templates" element={<EmailTemplates />} />
        <Route path="/email-sequences/:id" element={<EmailSequenceDetails />} />
        <Route path="/email-sequences" element={<EmailTemplates />} />
        <Route path="/email-campaigns" element={<EmailTemplates />} />
        <Route path="/sms-templates" element={<EmailTemplates />} />
        <Route path="/marketing" element={<EmailTemplates />} />
        
        {/* Inventory */}
        <Route path="/inventory" element={<Inventory />} />
        
        {/* Equipment */}
        <Route path="/equipment" element={<Dashboard />} />
        <Route path="/equipment/repair-plans/create" element={<CreateRepairPlan />} />
        
        {/* Maintenance */}
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/maintenance/dashboard" element={<MaintenanceDashboard />} />
        
        {/* Reminders */}
        <Route path="/reminders" element={<ServiceReminders />} />
        
        {/* Additional Pages */}
        <Route path="/forms" element={<Forms />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
