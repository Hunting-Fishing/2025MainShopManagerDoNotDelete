
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';

// Page imports
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Authentication from '@/pages/Authentication';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';

// Main app pages
import Customers from '@/pages/Customers';
import WorkOrders from '@/pages/WorkOrders';
import Invoices from '@/pages/Invoices';
import Inventory from '@/pages/Inventory';
import Equipment from '@/pages/Equipment';
import Calendar from '@/pages/Calendar';
import Chat from '@/pages/Chat';
import Shopping from '@/pages/Shopping';
import Reports from '@/pages/Reports';
import Team from '@/pages/Team';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';

// Developer pages
import Developer from '@/pages/Developer';
import { ServiceManagementLayout } from '@/pages/developer/service-management/ServiceManagementLayout';
import { ServiceOverviewPage } from '@/pages/developer/service-management/ServiceOverviewPage';
import { ServiceTreeViewPage } from '@/pages/developer/service-management/ServiceTreeViewPage';
import { ServiceExcelViewPage } from '@/pages/developer/service-management/ServiceExcelViewPage';
import { ServiceImportPage } from '@/pages/developer/service-management/ServiceImportPage';
import OrganizationManagement from '@/pages/developer/OrganizationManagement';
import ShoppingControls from '@/pages/developer/ShoppingControls';
import AnalyticsDashboard from '@/pages/developer/AnalyticsDashboard';
import UserManagement from '@/pages/developer/UserManagement';
import SecuritySettings from '@/pages/developer/SecuritySettings';
import SystemSettings from '@/pages/developer/SystemSettings';
import ToolsManagement from '@/pages/developer/ToolsManagement';

// Settings components
import { SettingsLayout } from '@/components/settings/SettingsLayout';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Authentication routes */}
          <Route path="/auth" element={<Authentication />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />

          {/* Protected routes with layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Main dashboard */}
            <Route index element={<Dashboard />} />
            
            {/* Core business pages */}
            <Route path="customers/*" element={<Customers />} />
            <Route path="work-orders/*" element={<WorkOrders />} />
            <Route path="invoices/*" element={<Invoices />} />
            <Route path="inventory/*" element={<Inventory />} />
            <Route path="equipment/*" element={<Equipment />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="chat/*" element={<Chat />} />
            <Route path="shopping/*" element={<Shopping />} />
            <Route path="reports/*" element={<Reports />} />
            <Route path="team/*" element={<Team />} />
            <Route path="notifications" element={<Notifications />} />
            
            {/* Settings */}
            <Route path="settings" element={<SettingsLayout />} />
            
            {/* Developer portal */}
            <Route path="developer" element={<Developer />} />
            <Route path="developer/service-management/*" element={<ServiceManagementLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ServiceOverviewPage />} />
              <Route path="tree" element={<ServiceTreeViewPage />} />
              <Route path="excel" element={<ServiceExcelViewPage />} />
              <Route path="import" element={<ServiceImportPage />} />
            </Route>
            <Route path="developer/organization" element={<OrganizationManagement />} />
            <Route path="developer/shopping" element={<ShoppingControls />} />
            <Route path="developer/analytics" element={<AnalyticsDashboard />} />
            <Route path="developer/users" element={<UserManagement />} />
            <Route path="developer/security" element={<SecuritySettings />} />
            <Route path="developer/system" element={<SystemSettings />} />
            <Route path="developer/tools" element={<ToolsManagement />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
