import { useState } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";

import Layout from './components/layout/Layout';

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
import { WorkOrderCreate } from './pages/WorkOrderCreate';
import WorkOrders from './pages/WorkOrders';
import { VehicleDetailsPage } from './components/customers/vehicles/VehicleDetailsPage';
import { CustomerDataProvider } from './contexts/CustomerDataProvider';

function App() {
  const location = useLocation();
  const [authToken, setAuthToken] = useState(null);
  
  // Logic to handle authentication (not relevant to this task)
  const isLoggedIn = !!authToken; // Example: Check if authToken exists
  
  const handleLogin = (token: string) => {
    setAuthToken(token);
  };

  const handleLogout = () => {
    setAuthToken(null);
  };

  // Get page title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard | Easy Shop Manager';
      case '/customers':
        return 'Customers | Easy Shop Manager';
      case '/customers/new':
        return 'Create Customer | Easy Shop Manager';
      case '/team':
        return 'Team | Easy Shop Manager';
      case '/settings':
        return 'Settings | Easy Shop Manager';
      case '/reports':
        return 'Reports | Easy Shop Manager';
      case '/login':
        return 'Login | Easy Shop Manager';
      default:
        return 'Easy Shop Manager';
    }
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
      </Helmet>

      <Routes>
        {/* Public routes that don't require the main layout */}
        <Route path="/login" element={<Login />} />
        
        {/* Main layout with protected routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          {/* Customer routes */}
          <Route path="customers" element={<Customers />} />
          <Route path="customers/new" element={<CreateCustomer />} />
          <Route path="customers/:customerId" element={<CustomerDataProvider><>Customer Details</></CustomerDataProvider>} />
          <Route path="customers/:customerId/edit" element={<EditCustomer />} />
          <Route path="customers/:customerId/vehicles/:vehicleId" element={<VehicleDetailsPage />} />
          
          {/* Team routes */}
          <Route path="team" element={<Team />} />
          
          {/* Work Order routes */}
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="work-orders/create" element={<WorkOrderCreate />} />

          {/* Invoice routes */}
          <Route path="invoices" element={<>Invoices</>} />
          <Route path="invoices/new" element={<>Create Invoice</>} />
          <Route path="invoices/:invoiceId" element={<>Invoice Details</>} />
          
          {/* Settings routes */}
          <Route path="settings" element={<Settings />} />
          <Route path="settings/account" element={<AccountSettings />} />
          <Route path="settings/company" element={<CompanySettings />} />
          <Route path="settings/security" element={<SecuritySettings />} />
          <Route path="settings/security-advanced" element={<SecurityAdvancedSettings />} />
          <Route path="settings/notifications" element={<NotificationSettings />} />
          <Route path="settings/branding" element={<BrandingSettings />} />
          <Route path="settings/appearance" element={<AppearanceSettings />} />
          <Route path="settings/email" element={<EmailSettings />} />
          <Route path="settings/integrations" element={<IntegrationSettings />} />
          <Route path="settings/loyalty" element={<LoyaltySettings />} />
          <Route path="settings/inventory" element={<InventorySettings />} />
          <Route path="settings/team" element={<TeamHistorySettings />} />
          <Route path="settings/email-scheduling" element={<EmailSchedulingSettings />} />
          <Route path="settings/export" element={<DataExportSettings />} />
          <Route path="settings/language" element={<LanguageSettings />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
      <Toaster />
    </>
  );
}

export default App;
