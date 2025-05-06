
import { RouteObject } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Team from './pages/Team';
import TeamMemberProfile from './pages/TeamMemberProfile';
import Index from './pages/Index';
import DeveloperPortal from './pages/DeveloperPortal';
import ShoppingControls from './pages/developer/ShoppingControls';
import ServiceManagement from './pages/developer/ServiceManagement';
import AppearanceSettings from './pages/settings/AppearanceSettings';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: '/team',
        element: <Team />
      },
      {
        path: '/team/:id',
        element: <TeamMemberProfile />
      },
      {
        path: '/developer',
        element: <DeveloperPortal />
      },
      {
        path: '/developer/shopping-controls',
        element: <ShoppingControls />
      },
      {
        path: '/developer/service-management',
        element: <ServiceManagement />
      },
      {
        path: '/settings/appearance',
        element: <AppearanceSettings />
      },
    ]
  }
];

export default routes;
