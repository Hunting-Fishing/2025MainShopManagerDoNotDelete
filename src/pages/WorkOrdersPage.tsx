
import React from 'react';
import { WorkOrdersContainer } from '@/components/workOrders/WorkOrdersContainer';
import { Helmet } from 'react-helmet-async';

export default function WorkOrdersPage() {
  return (
    <>
      <Helmet>
        <title>Work Orders | Auto Shop Management</title>
      </Helmet>
      <WorkOrdersContainer />
    </>
  );
}
