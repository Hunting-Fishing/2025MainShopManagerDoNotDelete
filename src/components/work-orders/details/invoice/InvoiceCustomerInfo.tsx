
import React from 'react';
import { format, addDays } from 'date-fns';
import { WorkOrder } from '@/types/workOrder';

interface InvoiceCustomerInfoProps {
  workOrder: WorkOrder;
}

export function InvoiceCustomerInfo({ workOrder }: InvoiceCustomerInfoProps) {
  const customerName = workOrder.customer || workOrder.customer_name || 'N/A';
  const customerEmail = workOrder.customer_email || 'N/A';
  const customerPhone = workOrder.customer_phone || 'N/A';
  const shortId = workOrder.id.slice(0, 8);

  return (
    <div className="grid grid-cols-2 gap-8 mb-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
        <p className="text-gray-900 font-medium">{customerName}</p>
        <p className="text-gray-600 text-sm">{customerEmail}</p>
        <p className="text-gray-600 text-sm">{customerPhone}</p>
      </div>
      
      <div className="text-right">
        <InvoiceDates workOrderShortId={shortId} />
      </div>
    </div>
  );
}

interface InvoiceDatesProps {
  workOrderShortId: string;
}

function InvoiceDates({ workOrderShortId }: InvoiceDatesProps) {
  const currentDate = new Date();
  const dueDate = addDays(currentDate, 30);

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <span className="text-gray-600">Issue Date:</span>
      <span className="text-gray-900">{format(currentDate, 'MMM dd, yyyy')}</span>
      
      <span className="text-gray-600">Due Date:</span>
      <span className="text-gray-900">{format(dueDate, 'MMM dd, yyyy')}</span>
      
      <span className="text-gray-600">Work Order:</span>
      <span className="text-gray-900">#{workOrderShortId}</span>
    </div>
  );
}
