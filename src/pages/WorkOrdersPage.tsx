
import React from 'react';
import { WorkOrdersContainer } from '@/components/workOrders/WorkOrdersContainer';
import { Helmet } from 'react-helmet-async';

export default function WorkOrdersPage() {
  return (
    <>
      <Helmet>
        <title>Work Orders | Auto Shop Management</title>
        <meta name="description" content="Manage and track all work orders" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <WorkOrdersContainer />
      </div>
    </>
  );
}
