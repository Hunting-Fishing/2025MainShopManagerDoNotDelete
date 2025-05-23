
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
import { Layout } from "./components/Layout";
import { NotificationsProvider } from './context/notifications';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import { ImpersonationProvider } from './contexts/ImpersonationContext';
import { OnboardingGate } from './components/onboarding/OnboardingGate';

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

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
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
                  
                  {/* Protected routes with onboarding gate */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <OnboardingGate>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </OnboardingGate>
                    </ProtectedRoute>
                  } />

                  <Route path="/settings/*" element={
                    <ProtectedRoute>
                      <OnboardingGate>
                        <Layout>
                          <Settings />
                        </Layout>
                      </OnboardingGate>
                    </ProtectedRoute>
                  } />

                  {/* Customer Management Routes */}
                  <Route path="/customers" element={
                    <ProtectedRoute>
                      <OnboardingGate>
                        <Layout>
                          <Customers />
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

                  {/* Invoice Routes */}
                  <Route path="/invoices" element={
                    <ProtectedRoute>
                      <OnboardingGate>
                        <Layout>
                          <Invoices />
                        </Layout>
                      </OnboardingGate>
                    </ProtectedRoute>
                  } />

                  <Route path="/invoice/create" element={
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

                  {/* Work Order Routes */}
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

                  {/* Inventory Routes */}
                  <Route path="/inventory" element={
                    <ProtectedRoute>
                      <OnboardingGate>
                        <Layout>
                          <Inventory />
                        </Layout>
                      </OnboardingGate>
                    </ProtectedRoute>
                  } />

                  {/* Team Routes */}
                  <Route path="/team" element={
                    <ProtectedRoute>
                      <OnboardingGate>
                        <Layout>
                          <Team />
                        </Layout>
                      </OnboardingGate>
                    </ProtectedRoute>
                  } />

                  {/* Reports & Analytics */}
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <OnboardingGate>
                        <Layout>
                          <Reports />
                        </Layout>
                      </OnboardingGate>
                    </ProtectedRoute>
                  } />

                  {/* Calendar & Communication */}
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <OnboardingGate>
                        <Layout>
                          <Calendar />
                        </Layout>
                      </OnboardingGate>
                    </ProtectedRoute>
                  } />

                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <OnboardingGate>
                        <Layout>
                          <Chat />
                        </Layout>
                      </OnboardingGate>
                    </ProtectedRoute>
                  } />

                  {/* Admin-only routes */}
                  <Route path="/developer/service-management" element={
                    <ProtectedRoute requiredRole="admin">
                      <OnboardingGate>
                        <Layout>
                          <ServiceManagement />
                        </Layout>
                      </OnboardingGate>
                    </ProtectedRoute>
                  } />

                  <Route path="/developer/shopping-controls" element={
                    <ProtectedRoute requiredRole="admin">
                      <OnboardingGate>
                        <Layout>
                          <ShoppingControls />
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
  );
}

export default App;
