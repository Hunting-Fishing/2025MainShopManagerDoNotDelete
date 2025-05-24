
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import InvoiceCreate from "./pages/InvoiceCreate";
import { Layout } from "./components/layout/Layout";
import { NotificationsProvider } from './context/notifications';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import { ImpersonationProvider } from './contexts/ImpersonationContext';
import { OnboardingGate } from './components/onboarding/OnboardingGate';
import { ErrorBoundary } from './components/error/ErrorBoundary';
// Import all pages
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import CreateCustomer from './pages/CreateCustomer';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import Inventory from './pages/Inventory';
import Team from './pages/Team';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import WorkOrderCreate from './pages/WorkOrderCreate';
import WorkOrderDetails from './pages/WorkOrderDetails';
import CustomersPage from './pages/CustomersPage';
import WorkOrdersPage from './pages/WorkOrdersPage';

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <NotificationsProvider>
              <ImpersonationProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Protected routes with Layout and OnboardingGate */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    {/* Customers routes */}
                    <Route path="/customers" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <CustomersPage />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/customers/create" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <CreateCustomer />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/customers/:id" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <CustomerDetails />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    {/* Work Orders routes */}
                    <Route path="/work-orders" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <WorkOrdersPage />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/work-orders/create" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <WorkOrderCreate />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/work-orders/:id" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <WorkOrderDetails />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    {/* Invoices routes */}
                    <Route path="/invoices" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Invoices />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/invoices/create" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <InvoiceCreate />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/invoices/:id" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <InvoiceDetails />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    {/* Inventory routes */}
                    <Route path="/inventory" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Inventory />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    {/* Team routes */}
                    <Route path="/team" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Team />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    {/* Reports routes */}
                    <Route path="/reports" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Reports />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    {/* Calendar routes */}
                    <Route path="/calendar" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Calendar />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    {/* Chat routes */}
                    <Route path="/chat" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Chat />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    {/* Settings routes */}
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Settings />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />

                    {/* Catch-all route for 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </ImpersonationProvider>
            </NotificationsProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
