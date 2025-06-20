
import React from 'react';
import { useParams } from 'react-router-dom';
import { WorkOrderDetailsView } from '@/components/work-orders/WorkOrderDetailsView';

const WorkOrderDetails = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-red-200/60 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Work Order</h1>
            <p className="text-slate-600">No work order ID provided</p>
          </div>
        </div>
      </div>
    );
  }

  return <WorkOrderDetailsView workOrderId={id} />;
};

export default WorkOrderDetails;
