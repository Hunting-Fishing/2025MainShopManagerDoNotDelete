
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import CreateCustomer from './pages/CreateCustomer';
import NotFound from './pages/NotFound';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetails from './pages/WorkOrderDetails';
import CreateWorkOrder from './pages/CreateWorkOrder';
import WorkOrderCreate from './pages/WorkOrderCreate';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import InvoiceCreate from './pages/InvoiceCreate';
import Calendar from './pages/Calendar';
import Team from './pages/Team';
import TeamMemberCreate from './pages/TeamMemberCreate';
import TeamMemberProfile from './pages/TeamMemberProfile';
import TeamRoles from './pages/TeamRoles';
import Inventory from './pages/Inventory';
import Equipment from './pages/Equipment';
import EquipmentDetails from './pages/EquipmentDetails';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Maintenance from './pages/Maintenance';
import ServiceReminders from './pages/ServiceReminders';
import Analytics from './pages/Analytics';
import Chat from './pages/Chat';
import FeedbackFormsPage from './pages/feedback/FeedbackFormsPage';
import FeedbackFormEditorPage from './pages/feedback/FeedbackFormEditorPage';
import FeedbackAnalyticsPage from './pages/feedback/FeedbackAnalyticsPage';
import RepairPlans from './pages/RepairPlans';
import RepairPlanDetails from './pages/RepairPlanDetails';
import CreateRepairPlan from './pages/CreateRepairPlan';
import EmailTemplates from './pages/EmailTemplates';
import EmailTemplateEditorPage from './pages/EmailTemplateEditorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/customers',
        element: <Customers />,
      },
      {
        path: '/customers/new',
        element: <CreateCustomer />,
      },
      {
        path: '/customers/edit/:id',
        element: <CreateCustomer />,
      },
      {
        path: '/customers/:id',
        element: <CustomerDetails />,
      },
      {
        path: '/work-orders',
        element: <WorkOrders />,
      },
      {
        path: '/work-orders/new',
        element: <CreateWorkOrder />,
      },
      {
        path: '/work-orders/:id',
        element: <WorkOrderDetails />,
      },
      {
        path: '/work-orders/:id/edit',
        element: <WorkOrderCreate />,
      },
      {
        path: '/invoices',
        element: <Invoices />,
      },
      {
        path: '/invoices/new',
        element: <InvoiceCreate />,
      },
      {
        path: '/invoices/new/:workOrderId',
        element: <InvoiceCreate />,
      },
      {
        path: '/invoices/:id',
        element: <InvoiceDetails />,
      },
      {
        path: '/calendar',
        element: <Calendar />,
      },
      {
        path: '/team',
        element: <Team />,
      },
      {
        path: '/team/create',
        element: <TeamMemberCreate />,
      },
      {
        path: '/team/roles',
        element: <TeamRoles />,
      },
      {
        path: '/team/:id',
        element: <TeamMemberProfile />,
      },
      {
        path: '/inventory',
        element: <Inventory />,
      },
      {
        path: '/equipment',
        element: <Equipment />,
      },
      {
        path: '/equipment/:id',
        element: <EquipmentDetails />,
      },
      {
        path: '/reports',
        element: <Reports />,
      },
      {
        path: '/maintenance',
        element: <Maintenance />,
      },
      {
        path: '/reminders',
        element: <ServiceReminders />,
      },
      {
        path: '/analytics',
        element: <Analytics />,
      },
      {
        path: '/settings/*',
        element: <Settings />,
      },
      {
        path: '/chat/:id?',
        element: <Chat />,
      },
      {
        path: '/feedback',
        element: <FeedbackFormsPage />,
      },
      {
        path: '/feedback/form/:id',
        element: <FeedbackAnalyticsPage />,
      },
      {
        path: '/feedback/editor/:id?',
        element: <FeedbackFormEditorPage />,
      },
      {
        path: '/repair-plans',
        element: <RepairPlans />,
      },
      {
        path: '/repair-plans/new',
        element: <CreateRepairPlan />,
      },
      {
        path: '/repair-plans/:id',
        element: <RepairPlanDetails />,
      },
      {
        path: '/email-templates',
        element: <EmailTemplates />,
      },
      {
        path: '/email-template-editor/:id?',
        element: <EmailTemplateEditorPage />,
      },
    ],
  },
]);

export default router;
