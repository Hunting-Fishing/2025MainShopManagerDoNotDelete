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
import AccountSettings from '@/pages/settings/AccountSettings';
import CompanySettings from '@/pages/settings/CompanySettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import NotificationSettings from '@/pages/settings/NotificationSettings';
import BrandingSettings from '@/pages/settings/BrandingSettings';
import AppearanceSettings from '@/pages/settings/AppearanceSettings';
import EmailSettings from '@/pages/settings/EmailSettings';
import LoyaltySettings from '@/pages/settings/LoyaltySettings';
import InventorySettings from '@/pages/settings/InventorySettings';
import TeamHistorySettings from '@/pages/settings/TeamHistorySettings';
import EmailSchedulingSettings from '@/pages/settings/EmailSchedulingSettings';
import DataExportSettings from '@/pages/settings/DataExportSettings';
import LanguageSettings from '@/pages/settings/LanguageSettings';
import SecurityAdvancedSettings from '@/pages/settings/SecurityAdvancedSettings';
import Index from '@/pages/Index';
import Inventory from '@/pages/Inventory';
import InventoryAdd from '@/pages/InventoryAdd';
import InventoryOrders from '@/pages/InventoryOrders';
import InventoryStock from '@/pages/InventoryStock';

// All routes must be declared here to be used by the RouterProvider
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Index />,
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
        path: 'inventory',
        element: <Inventory />,
      },
      {
        path: 'inventory/stock',
        element: <InventoryStock />,
      },
      {
        path: 'inventory/add',
        element: <InventoryAdd />,
      },
      {
        path: 'inventory/orders',
        element: <InventoryOrders />,
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
      // Settings routes
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'settings/account',
        element: <AccountSettings />,
      },
      {
        path: 'settings/company',
        element: <CompanySettings />,
      },
      {
        path: 'settings/security',
        element: <SecuritySettings />,
      },
      {
        path: 'settings/security-advanced',
        element: <SecurityAdvancedSettings />,
      },
      {
        path: 'settings/notifications',
        element: <NotificationSettings />,
      },
      {
        path: 'settings/branding',
        element: <BrandingSettings />,
      },
      {
        path: 'settings/appearance',
        element: <AppearanceSettings />,
      },
      {
        path: 'settings/email',
        element: <EmailSettings />,
      },
      {
        path: 'settings/integrations',
        element: <IntegrationSettings />,
      },
      {
        path: 'settings/loyalty',
        element: <LoyaltySettings />,
      },
      {
        path: 'settings/inventory',
        element: <InventorySettings />,
      },
      {
        path: 'settings/team',
        element: <TeamHistorySettings />,
      },
      {
        path: 'settings/email-scheduling',
        element: <EmailSchedulingSettings />,
      },
      {
        path: 'settings/export',
        element: <DataExportSettings />,
      },
      {
        path: 'settings/language',
        element: <LanguageSettings />,
      },
      // Developer portal routes
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
