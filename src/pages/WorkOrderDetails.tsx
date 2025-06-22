
import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { WorkOrderDetailsView } from '@/components/work-orders/WorkOrderDetailsView';

export default function WorkOrderDetails() {
  const { workOrderId } = useParams<{ workOrderId: string }>();

  if (!workOrderId) {
    return (
      <>
        <Helmet>
          <title>Work Order Not Found | ServicePro</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="container mx-auto p-6">
            <div className="bg-white rounded-xl shadow-sm border border-red-200/60 p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Work Order Not Found</h1>
              <p className="text-slate-600">No work order ID provided in the URL.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Work Order Details | ServicePro</title>
      </Helmet>
      <WorkOrderDetailsView workOrderId={workOrderId} />
    </>
  );
}
