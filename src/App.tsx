
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CustomerPortal from './pages/CustomerPortal';
import DeveloperPortal from './pages/DeveloperPortal';
import ClientBooking from './pages/ClientBooking';
import ServiceManagement from './pages/developer/ServiceManagement';
import ShoppingControls from './pages/developer/ShoppingControls';
import OrganizationManagement from './pages/developer/OrganizationManagement';
import InvoiceCreate from './pages/InvoiceCreate';
import { ImpersonationProvider } from './contexts/ImpersonationContext';

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ImpersonationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="customer-portal" element={<CustomerPortal />} />
              <Route path="developer" element={<DeveloperPortal />} />
              <Route path="client-booking" element={<ClientBooking />} />
              <Route path="developer/service-management" element={<ServiceManagement />} />
              <Route path="developer/shopping-controls" element={<ShoppingControls />} />
              <Route path="developer/organization-management" element={<OrganizationManagement />} />
              <Route path="invoice/create" element={<InvoiceCreate />} />
            </Route>
          </Routes>
        </Router>
      </ImpersonationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
