
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Import pages
import Dashboard from '@/pages/Dashboard';
import Team from '@/pages/Team';
import Chat from '@/pages/Chat';
import Forms from '@/pages/Forms';
import Calendar from '@/pages/Calendar';
import Reports from '@/pages/Reports';
import Invoices from '@/pages/Invoices';
import Equipment from '@/pages/Equipment';
import Feedback from '@/pages/Feedback';
import Analytics from '@/pages/Analytics';
import Inventory from '@/pages/Inventory';
import TeamCreate from '@/pages/TeamCreate';
import Authentication from '@/pages/Authentication';
import Login from '@/pages/Login';
import ErrorPage from '@/pages/error-page';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Authentication />} />
      <Route path="/login" element={<Login />} />
      <Route path="/staff-login" element={<Login />} />
      
      {/* Protected routes with layout */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="team" element={<Team />} />
              <Route path="team/create" element={<TeamCreate />} />
              <Route path="chat" element={<Chat />} />
              <Route path="forms" element={<Forms />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="reports" element={<Reports />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
