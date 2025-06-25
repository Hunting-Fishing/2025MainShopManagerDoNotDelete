
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WorkOrdersHeader } from '@/components/work-orders/WorkOrdersHeader';
import { WorkOrdersTable } from '@/components/work-orders/WorkOrdersTable';
import { WorkOrderDetailsView } from '@/components/work-orders/WorkOrderDetailsView';
import { WorkOrderCreateForm } from '@/components/work-orders/WorkOrderCreateForm';

/**
 * ⚠️ CRITICAL - DO NOT REPLACE WITH PLACEHOLDERS ⚠️
 * This page uses FULL work orders functionality with existing components
 * Includes: work order list, creation, details, management, status tracking
 * All components exist in /src/components/work-orders/
 */
export default function WorkOrders() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="p-6 space-y-6">
          <WorkOrdersHeader />
          <WorkOrdersTable />
        </div>
      } />
      <Route path="/create" element={<WorkOrderCreateForm />} />
      <Route path="/:id" element={<WorkOrderDetailsView />} />
    </Routes>
  );
}
