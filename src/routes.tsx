
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
      {
        path: 'tools',
        element: <AffiliateTool />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'developer',
        element: <DeveloperPortal />,
      },
      {
        path: 'developer/shopping-controls',
        element: <ShoppingControls />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

export default routes;
