
import React from 'react';
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Settings from "./pages/Settings";
import CustomerSettings from "./pages/CustomerSettings";
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Dashboard from './pages/Dashboard';
import WorkOrders from './pages/WorkOrders';
import Invoices from './pages/Invoices';
import Customers from './pages/Customers';
import Equipment from './pages/Equipment';
import Inventory from './pages/Inventory';
import ToolsShop from './pages/ToolsShop';
import Forms from './pages/Forms';
import Shopping from './pages/Shopping';
import Maintenance from './pages/Maintenance';
import CalendarPage from './pages/CalendarPage';
import Reminders from './pages/Reminders';
import Chat from './pages/Chat';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Marketing from './pages/Marketing';
import EmailTemplates from './pages/marketing/EmailTemplates';
import EmailCampaigns from './pages/marketing/EmailCampaigns';
import EmailSequences from './pages/marketing/EmailSequences';
import SMSTemplates from './pages/marketing/SMSTemplates';
import DeveloperPortal from './pages/developer/DeveloperPortal';
import ShoppingControls from './pages/developer/ShoppingControls';
import ServiceManagement from './pages/developer/ServiceManagement';
import RequireAuth from './components/auth/RequireAuth';
import PublicRoute from './components/auth/PublicRoute';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a simple loading component since we don't have useLoading
function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

const queryClient = new QueryClient();

function App() {
  // Remove the useLoading hook since we don't have access to it
  const isLoading = false;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <I18nextProvider i18n={i18n}>
            <AuthProvider>
              <ShopProvider>
                <div className="app-container">
                  <ToastContainer position="top-right" autoClose={3000} />
                  {isLoading && <Loading />}
                  <Routes>
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                    <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
                    <Route path="/verify-email" element={<PublicRoute><EmailVerificationPage /></PublicRoute>} />
                    <Route
                      path="/"
                      element={
                        <RequireAuth>
                          <Layout />
                        </RequireAuth>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="work-orders" element={<WorkOrders />} />
                      <Route path="invoices" element={<Invoices />} />
                      <Route path="customers" element={<Customers />} />
                      <Route path="equipment" element={<Equipment />} />
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="tools" element={<ToolsShop />} />
                      <Route path="forms" element={<Forms />} />
                      <Route path="shopping" element={<Shopping />} />
                      <Route path="maintenance" element={<Maintenance />} />
                      <Route path="calendar" element={<CalendarPage />} />
                      <Route path="reminders" element={<Reminders />} />
                      <Route path="chat" element={<Chat />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="team" element={<Team />} />
                      <Route path="marketing" element={<Marketing />} />
                      <Route path="email-templates" element={<EmailTemplates />} />
                      <Route path="email-campaigns" element={<EmailCampaigns />} />
                      <Route path="email-sequences" element={<EmailSequences />} />
                      <Route path="sms-templates" element={<SMSTemplates />} />
                      <Route path="developer" element={<DeveloperPortal />} />
                      <Route path="developer/shopping-controls" element={<ShoppingControls />} />
                      <Route path="developer/service-management" element={<ServiceManagement />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="settings/customer" element={<CustomerSettings />} />
                    </Route>
                  </Routes>
                </div>
              </ShopProvider>
            </AuthProvider>
          </I18nextProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
