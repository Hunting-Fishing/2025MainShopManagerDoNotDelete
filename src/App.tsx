
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AuthGate } from '@/components/AuthGate';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import Index from '@/pages/Index';

// Import pages
import Login from '@/pages/Login';
import StaffLogin from '@/pages/StaffLogin';
import Dashboard from '@/pages/Dashboard';
import WorkOrders from '@/pages/WorkOrders';
import Calendar from '@/pages/Calendar';
import Customers from '@/pages/Customers';
import Inventory from '@/pages/Inventory';
import Invoices from '@/pages/Invoices';
import Quotes from '@/pages/Quotes';
import Settings from '@/pages/Settings';
import TeamManagement from '@/pages/TeamManagement';
import Signup from '@/pages/Signup';
import CustomerPortal from '@/pages/CustomerPortal';
import ClientBooking from '@/pages/ClientBooking';
import QuoteDetails from '@/pages/QuoteDetails';
import WorkOrderDetails from '@/pages/WorkOrderDetails';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Payments from '@/pages/Payments';
import Reminders from '@/pages/Reminders';
import SmsTemplates from '@/pages/SmsTemplates';
import ServiceCategory from '@/pages/ServiceCategory';
import ServiceSubcategory from '@/pages/ServiceSubcategory';
import ServiceJob from '@/pages/ServiceJob';
import ServiceCatalog from '@/pages/ServiceCatalog';
import RepairPlans from '@/pages/RepairPlans';
import Team from '@/pages/Team';
import InventoryManager from '@/pages/InventoryManager';
import InventoryOrders from '@/pages/InventoryOrders';
import InventoryLocations from '@/pages/InventoryLocations';
import InventorySuppliers from '@/pages/InventorySuppliers';
import Shopping from '@/pages/Shopping';
import WishlistPage from '@/pages/WishlistPage';
import Checkout from '@/pages/Checkout';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/staff-login" element={<StaffLogin />} />
              <Route path="/customer-portal" element={<CustomerPortal />} />
              <Route path="/client-booking" element={<ClientBooking />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Dashboard />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Work Orders */}
              <Route path="/work-orders" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <WorkOrders />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/work-orders/create" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <WorkOrderCreate />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/work-orders/:workOrderId" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <WorkOrderDetails />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Calendar & Scheduling */}
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Calendar />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/service-reminders" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Reminders />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Customers */}
              <Route path="/customers" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Customers />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/customer-comms" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <SmsTemplates />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/call-logger" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Call Logger</h1>
                        <p className="text-muted-foreground">Call logging system coming soon.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Inventory */}
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Inventory />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/manager" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <InventoryManager />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/orders" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <InventoryOrders />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/locations" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <InventoryLocations />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory/suppliers" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <InventorySuppliers />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Financial */}
              <Route path="/quotes" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Quotes />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/quotes/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <QuoteDetails />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Invoices />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/invoices/:id/edit" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <InvoiceEdit />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Payments />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/service-board" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Service Board</h1>
                        <p className="text-muted-foreground">Service board management coming soon.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Company */}
              <Route path="/company-profile" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Company Profile</h1>
                        <p className="text-muted-foreground">Company profile management coming soon.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/team" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Team />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/vehicles" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Vehicles</h1>
                        <p className="text-muted-foreground">Vehicle management coming soon.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/documents" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Documents</h1>
                        <p className="text-muted-foreground">Document management coming soon.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Services */}
              <Route path="/service-editor" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Service Editor</h1>
                        <p className="text-muted-foreground">Service editor coming soon.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/services" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <ServiceCatalog />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/services/:categoryId" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <ServiceCategory />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/services/:categoryId/:subcategoryId" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <ServiceSubcategory />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/services/job/:jobId" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <ServiceJob />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/repair-plans" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <RepairPlans />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Settings */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Settings />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings/*" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Settings />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Store/Shopping */}
              <Route path="/shopping" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Shopping />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/shopping/cart" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
                        <p className="text-muted-foreground">Shopping cart functionality.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <WishlistPage />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Orders</h1>
                        <p className="text-muted-foreground">Order history and tracking.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <Checkout />
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Support */}
              <Route path="/help" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Help & Support</h1>
                        <p className="text-muted-foreground">Help documentation coming soon.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/security" element={
                <ProtectedRoute>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Security</h1>
                        <p className="text-muted-foreground">Security settings coming soon.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Developer Routes */}
              <Route path="/developer/*" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <ResponsiveContainer>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Developer Tools</h1>
                        <p className="text-muted-foreground">Developer tools coming soon.</p>
                      </div>
                    </ResponsiveContainer>
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={
                <Layout>
                  <ResponsiveContainer>
                    <div className="p-6 text-center">
                      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                    </div>
                  </ResponsiveContainer>
                </Layout>
              } />
          </Routes>
        </ErrorBoundary>
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
