import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import UserProfile from '@/pages/UserProfile';
import UserOrders from '@/pages/UserOrders';
import { Layout } from '@/components/layout/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/shopping" element={<div>Shopping Page</div>} />
          <Route path="/wishlist" element={<div>Wishlist Page</div>} />
          <Route path="/my-reviews" element={<div>My Reviews Page</div>} />
          <Route path="/customers" element={<div>Customers Page</div>} />
          <Route path="/inventory" element={<div>Inventory Page</div>} />
          <Route path="/work-orders" element={<div>Work Orders Page</div>} />
          <Route path="/calendar" element={<div>Calendar Page</div>} />
          <Route path="/analytics" element={<div>Analytics Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
