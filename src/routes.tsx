
import { RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import Customers from '@/pages/Customers';
import CreateCustomer from '@/pages/CreateCustomer';
import EditCustomer from '@/pages/EditCustomer';
import Reports from '@/pages/Reports';
import Team from '@/pages/Team';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import { VehicleDetailsPage } from '@/components/customers/vehicles/VehicleDetailsPage';
import AffiliateTool from '@/pages/AffiliateTool';
import DeveloperPortal from '@/pages/DeveloperPortal';
import ShoppingControls from '@/pages/developer/ShoppingControls';
import ToolCategoryPage from '@/pages/ToolCategoryPage';
import ToolDetailPage from '@/pages/ToolDetailPage';
import ServiceManagement from '@/pages/developer/ServiceManagement';
import Forms from '@/pages/Forms';
import IntegrationSettings from '@/pages/settings/IntegrationSettings';

// All routes must be declared here to be used by the RouterProvider
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'customers',
        element: <Customers />,
      },
      {
        path: 'customers/create',
        element: <CreateCustomer />,
      },
      {
        path: 'customers/:id/edit',
        element: <EditCustomer />,
      },
      {
        path: 'customers/:customerId/vehicles/:vehicleId',
        element: <VehicleDetailsPage />,
      },
      {
        path: 'work-orders',
        element: <WorkOrders />,
      },
      {
        path: 'work-orders/create',
        element: <WorkOrderCreate />,
      },
      {
        path: 'work-orders/:id',
        element: <WorkOrderDetails />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'team',
        element: <Team />,
      },
      // Tool shop routes
      {
        path: 'tools',
        element: <AffiliateTool />,
      },
      {
        path: 'tools/:category',
        element: <ToolCategoryPage />,
      },
      {
        path: 'tools/:category/:toolId',
        element: <ToolDetailPage />,
      },
      // Shopping routes - maintain the same component as tools for now
      {
        path: 'shopping',
        element: <AffiliateTool />,
      },
      {
        path: 'shopping/:category',
        element: <ToolCategoryPage />,
      },
      {
        path: 'shopping/:category/:productId',
        element: <ToolDetailPage />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'settings/integrations',
        element: <IntegrationSettings />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      // Developer portal routes - Make sure these are correctly defined
      {
        path: 'developer',
        element: <DeveloperPortal />,
      },
      {
        path: 'developer/shopping-controls',
        element: <ShoppingControls />,
      },
      {
        path: 'developer/service-management',
        element: <ServiceManagement />,
      },
      // Forms route
      {
        path: 'forms',
        element: <Forms />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

export default routes;
