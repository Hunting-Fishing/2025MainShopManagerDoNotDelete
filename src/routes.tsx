
import { Navigate, RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Shopping from '@/pages/Shopping';
import ShoppingCategories from '@/pages/ShoppingCategories';
import ProductSuggestionsPage from '@/pages/ProductSuggestionsPage';
import CategoryDetail from '@/pages/CategoryDetail';

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
        path: 'shopping',
        element: <Shopping />,
      },
      {
        path: 'shopping/categories',
        element: <ShoppingCategories />,
      },
      {
        path: 'shopping/categories/:slug',
        element: <CategoryDetail />,
      },
      {
        path: 'shopping/suggestions',
        element: <ProductSuggestionsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
];

export default routes;
