import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { AuthGate } from '@/components/AuthGate';

// Import pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

// Placeholder component for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-muted-foreground">This page is under construction.</p>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <AuthGate>
              <Layout>
                <Dashboard />
              </Layout>
            </AuthGate>
          } />
          
          {/* Other protected routes with placeholder content */}
          <Route path="/customers" element={
            <AuthGate>
              <Layout>
                <PlaceholderPage title="Customers" />
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/work-orders" element={
            <AuthGate>
              <Layout>
                <PlaceholderPage title="Work Orders" />
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/inventory/*" element={
            <AuthGate>
              <Layout>
                <PlaceholderPage title="Inventory" />
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/calendar" element={
            <AuthGate>
              <Layout>
                <PlaceholderPage title="Calendar" />
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/quotes" element={
            <AuthGate>
              <Layout>
                <PlaceholderPage title="Quotes" />
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/invoices" element={
            <AuthGate>
              <Layout>
                <PlaceholderPage title="Invoices" />
              </Layout>
            </AuthGate>
          } />
          
          <Route path="/settings/*" element={
            <AuthGate>
              <Layout>
                <PlaceholderPage title="Settings" />
              </Layout>
            </AuthGate>
          } />
          
          {/* Catch all other routes */}
          <Route path="*" element={
            <AuthGate>
              <Layout>
                <PlaceholderPage title="Page Not Found" />
              </Layout>
            </AuthGate>
          } />
        </Routes>
        <Toaster />
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
