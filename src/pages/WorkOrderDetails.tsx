
import React from 'react';
import { useParams } from 'react-router-dom';
import { WorkOrderDetailsView } from '@/components/work-orders/WorkOrderDetailsView';

const WorkOrderDetails = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Invalid Work Order</h1>
          <p className="text-muted-foreground">No work order ID provided</p>
        </div>
      </div>
    );
  }

  return <WorkOrderDetailsView />;
};

export default WorkOrderDetails;
