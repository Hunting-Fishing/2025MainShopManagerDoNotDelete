import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { CustomerLoginRequired } from '@/components/customer-portal/CustomerLoginRequired';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Customers = React.lazy(() => import('@/pages/Customers'));
const CreateCustomer = React.lazy(() => import('@/pages/CreateCustomer'));
const CustomerDetails = React.lazy(() => import('@/pages/CustomerDetails'));
const CustomerVehicleDetails = React.lazy(() => import('@/pages/CustomerVehicleDetails'));
const CreateWorkOrder = React.lazy(() => import('@/pages/CreateWorkOrder'));
const WorkOrderDetails = React.lazy(() => import('@/pages/WorkOrderDetails'));
const Invoices = React.lazy(() => import('@/pages/Invoices'));
const InvoiceCreate = React.lazy(() => import('@/pages/InvoiceCreate'));
const InvoiceDetails = React.lazy(() => import('@/pages/InvoiceDetails'));
const Inventory = React.lazy(() => import('@/pages/Inventory'));
const InventoryAdd = React.lazy(() => import('@/pages/InventoryAdd'));
const Equipment = React.lazy(() => import('@/pages/Equipment'));
const EquipmentDetails = React.lazy(() => import('@/pages/EquipmentDetails'));
const Team = React.lazy(() => import('@/pages/Team'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const Calendar = React.lazy(() => import('@/pages/Calendar'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const Maintenance = React.lazy(() => import('@/pages/Maintenance'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Authentication = React.lazy(() => import('@/pages/Authentication'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const VehicleInspectionForm = React.lazy(() => import('@/pages/VehicleInspectionForm'));

// Developer pages
const DeveloperPortal = React.lazy(() => import('@/pages/DeveloperPortal'));

// Customer Portal pages
const CustomerPortal = React.lazy(() => import('@/pages/CustomerPortal'));
const CustomerPortalLogin = React.lazy(() => import('@/pages/CustomerPortalLogin'));

// Public pages
const AffiliateTool = React.lazy(() => import('@/pages/AffiliateTool'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Authentication />} />
        <Route path="/affiliate" element={<AffiliateTool />} />
        
        {/* Customer Portal routes */}
        <Route path="/customer-portal">
          <Route path="login" element={<CustomerPortalLogin />} />
          <Route path="" element={
            <CustomerLoginRequired>
              <CustomerPortal />
            </CustomerLoginRequired>
          } />
        </Route>

        {/* Main application routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <OnboardingGate>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Customer routes */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/create" element={<CreateCustomer />} />
                  <Route path="/customers/:id" element={<CustomerDetails />} />
                  <Route path="/customers/:customerId/vehicles/:vehicleId" element={<CustomerVehicleDetails />} />
                  
                  {/* Work Order routes */}
                  <Route path="/work-orders/create" element={<CreateWorkOrder />} />
                  <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                  
                  {/* Invoice routes */}
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/invoices/create" element={<InvoiceCreate />} />
                  <Route path="/invoices/:id" element={<InvoiceDetails />} />
                  
                  {/* Inventory routes */}
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/add" element={<InventoryAdd />} />
                  
                  {/* Equipment routes */}
                  <Route path="/equipment" element={<Equipment />} />
                  <Route path="/equipment/:id" element={<EquipmentDetails />} />
                  
                  {/* Other main routes */}
                  <Route path="/team" element={<Team />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/inspection" element={<VehicleInspectionForm />} />
                  
                  {/* Developer routes */}
                  <Route path="/developer/*" element={
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <DeveloperPortal />
                    </RoleGuard>
                  } />
                  
                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </OnboardingGate>
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
