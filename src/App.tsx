
import { useState } from 'react';
import { createBrowserRouter, RouterProvider, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";

import Layout from './components/layout/Layout';
import routes from './routes';

import './App.css';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CreateCustomer from './pages/CreateCustomer';
import EditCustomer from './pages/EditCustomer';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Shopping from './pages/Shopping';
import ShoppingAdmin from './pages/ShoppingAdmin';
import ShoppingCategories from './pages/ShoppingCategories'; 
import CategoryDetailPage from './pages/CategoryDetailPage';
import ProductsPage from './pages/ProductsPage';

// Import the settings pages
import AccountSettings from './pages/settings/AccountSettings';
import CompanySettings from './pages/settings/CompanySettings';
import SecuritySettings from './pages/settings/SecuritySettings';
import SecurityAdvancedSettings from './pages/settings/SecurityAdvancedSettings';
import NotificationSettings from './pages/settings/NotificationSettings';
import BrandingSettings from './pages/settings/BrandingSettings';
import AppearanceSettings from './pages/settings/AppearanceSettings';
import EmailSettings from './pages/settings/EmailSettings';
import IntegrationSettings from './pages/settings/IntegrationSettings';
import LoyaltySettings from './pages/settings/LoyaltySettings';
import InventorySettings from './pages/settings/InventorySettings';
import TeamHistorySettings from './pages/settings/TeamHistorySettings';
import EmailSchedulingSettings from './pages/settings/EmailSchedulingSettings';
import DataExportSettings from './pages/settings/DataExportSettings';
import LanguageSettings from './pages/settings/LanguageSettings';
import WorkOrderCreate from './pages/WorkOrderCreate';
import WorkOrders from './pages/WorkOrders';
import WorkOrderDetails from './pages/WorkOrderDetails';
import { VehicleDetailsPage } from './components/customers/vehicles/VehicleDetailsPage';
import { CustomerDataProvider } from './contexts/CustomerDataProvider';

// Create a browser router
const router = createBrowserRouter(routes);

function App() {
  const [authToken, setAuthToken] = useState(null);
  
  // Logic to handle authentication (not relevant to this task)
  const isLoggedIn = !!authToken; // Example: Check if authToken exists
  
  const handleLogin = (token: string) => {
    setAuthToken(token);
  };

  const handleLogout = () => {
    setAuthToken(null);
  };

  return (
    <>
      <Helmet>
        <title>Easy Shop Manager</title>
      </Helmet>

      <RouterProvider router={router} />
      
      <Toaster />
    </>
  );
}

export default App;
