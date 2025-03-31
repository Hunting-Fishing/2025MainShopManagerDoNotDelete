
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import CustomerForm from './pages/CustomerForm';
import NotFound from './pages/NotFound';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetails from './pages/WorkOrderDetails';
import WorkOrderForm from './pages/WorkOrderForm';
import WorkOrderEdit from './pages/WorkOrderEdit';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import InvoiceCreate from './pages/InvoiceCreate';
import Calendar from './pages/Calendar';
import Team from './pages/Team';
import TeamCreate from './pages/TeamCreate';
import TeamMember from './pages/TeamMember';
import TeamRoles from './pages/TeamRoles';
import Inventory from './pages/Inventory';
import Equipment from './pages/Equipment';
import EquipmentDetails from './pages/EquipmentDetails';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Maintenance from './pages/Maintenance';
import ServiceReminders from './pages/ServiceReminders';
import Analytics from './pages/Analytics';
import ChatPage from './pages/ChatPage';
import FeedbackPage from './pages/FeedbackPage';
import FeedbackForm from './pages/FeedbackForm';
import FeedbackFormEditor from './pages/FeedbackFormEditor';
import RepairPlans from './pages/RepairPlans';
import RepairPlanDetails from './pages/RepairPlanDetails';
import RepairPlanCreate from './pages/RepairPlanCreate';
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
        element: <CustomerForm />,
      },
      {
        path: '/customers/edit/:id',
        element: <CustomerForm />,
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
        element: <WorkOrderForm />,
      },
      {
        path: '/work-orders/:id',
        element: <WorkOrderDetails />,
      },
      {
        path: '/work-orders/:id/edit',
        element: <WorkOrderEdit />,
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
        element: <TeamCreate />,
      },
      {
        path: '/team/roles',
        element: <TeamRoles />,
      },
      {
        path: '/team/:id',
        element: <TeamMember />,
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
        element: <ChatPage />,
      },
      {
        path: '/feedback',
        element: <FeedbackPage />,
      },
      {
        path: '/feedback/form/:id',
        element: <FeedbackForm />,
      },
      {
        path: '/feedback/editor/:id?',
        element: <FeedbackFormEditor />,
      },
      {
        path: '/repair-plans',
        element: <RepairPlans />,
      },
      {
        path: '/repair-plans/new',
        element: <RepairPlanCreate />,
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
