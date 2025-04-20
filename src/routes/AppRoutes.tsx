
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import NotFound from '@/pages/NotFound';
import WorkOrders from '@/pages/WorkOrders'; // Updated import
import WorkOrderDetail from '@/pages/WorkOrderDetail';
import WorkOrderCreate from '@/pages/WorkOrderCreate';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<WorkOrders />} />
        <Route path="/work-orders" element={<WorkOrders />} />
        <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
        <Route path="/work-orders/new" element={<WorkOrderCreate />} />
        <Route path="/work-orders/:id/edit" element={<WorkOrderCreate />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
