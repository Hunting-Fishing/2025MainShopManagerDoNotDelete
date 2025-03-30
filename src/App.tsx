import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { WorkOrders } from '@/pages/WorkOrders';
import { Customers } from '@/pages/Customers';
import { Invoices } from '@/pages/Invoices';
import { Calendar } from '@/pages/Calendar';
import { Reports } from '@/pages/Reports';
import { Inventory } from '@/pages/Inventory';
import { Team } from '@/pages/Team';
import { Settings } from '@/pages/Settings';
import { SmsTemplates } from '@/pages/SmsTemplates';
import { Maintenance } from '@/pages/Maintenance';
import { Equipment } from '@/pages/Equipment';
import { Reminders } from '@/pages/Reminders';
import { Layout } from '@/components/layout/Layout';
import { WorkOrderDetails } from '@/pages/WorkOrderDetails';
import { CustomerDetails } from '@/pages/CustomerDetails';
import { CreateWorkOrder } from '@/pages/CreateWorkOrder';
import { CreateCustomer } from '@/pages/CreateCustomer';
import { CreateInvoice } from '@/pages/CreateInvoice';
import { TeamMemberProfile } from '@/pages/TeamMemberProfile';
import { CreateTeamMember } from '@/pages/CreateTeamMember';
import CustomerServiceHistory from '@/pages/CustomerServiceHistory';
import { InvoiceDetails } from '@/pages/InvoiceDetails';
import { EquipmentDetails } from '@/pages/EquipmentDetails';
import { RepairPlans } from '@/pages/RepairPlans';
import { RepairPlanDetails } from '@/pages/RepairPlanDetails';
import { CreateRepairPlan } from '@/pages/CreateRepairPlan';
import EmailTemplates from '@/pages/EmailTemplates';
import EmailCampaigns from '@/pages/EmailCampaigns';
import EmailSequences from '@/pages/EmailSequences';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="work-orders" element={<WorkOrders />} />
            <Route path="work-orders/:id" element={<WorkOrderDetails />} />
            <Route path="work-orders/create" element={<CreateWorkOrder />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="customers/create" element={<CreateCustomer />} />
            <Route path="customers/service-history/:customer" element={<CustomerServiceHistory />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/create" element={<CreateInvoice />} />
            <Route path="invoices/:id" element={<InvoiceDetails />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Reports />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="team" element={<Team />} />
            <Route path="team/create" element={<CreateTeamMember />} />
            <Route path="team/:id" element={<TeamMemberProfile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="sms-templates" element={<SmsTemplates />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="equipment/:id" element={<EquipmentDetails />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="repair-plans" element={<RepairPlans />} />
            <Route path="repair-plans/create" element={<CreateRepairPlan />} />
            <Route path="repair-plans/:id" element={<RepairPlanDetails />} />
            <Route path="email-templates" element={<EmailTemplates />} />
            <Route path="email-campaigns" element={<EmailCampaigns />} />
            <Route path="email-sequences" element={<EmailSequences />} />
            <Route path="*" element={<div>Not Found</div>} />
          </Route>
        </Routes>
      </Router>
    </Suspense>
  );
}

export default App;
