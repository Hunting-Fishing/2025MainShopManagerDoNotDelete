
import React from 'react';

interface InvoiceHeaderProps {
  workOrderId: string;
}

export function InvoiceHeader({ workOrderId }: InvoiceHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Invoice</h1>
      <p className="text-lg text-gray-600">Work Order #{workOrderId.slice(0, 8)}</p>
      <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
    </div>
  );
}
