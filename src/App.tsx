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
import { ImpersonationProvider } from './contexts/ImpersonationContext';
import { OnboardingGate } from './components/onboarding/OnboardingGate';
import { ErrorBoundary } from './components/error/ErrorBoundary';
// Import additional pages that need protection
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
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/" element={<Index />} />

                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/customers" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <CustomersPage />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/work-orders" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <WorkOrdersPage />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/invoices" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Invoices />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/inventory" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Inventory />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <Settings />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />

                    {/* Legacy routes - keeping for compatibility */}
                    <Route path="/customers/create" element={
                      <ProtectedRoute>
                        <OnboardingGate>
                          <Layout>
                            <CreateCustomer />
                          </Layout>
                        </OnboardingGate>
                      </ProtectedRoute>
                    } />
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
