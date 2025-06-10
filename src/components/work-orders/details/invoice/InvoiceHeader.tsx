
import React from 'react';
import { format, addDays } from 'date-fns';

interface InvoiceHeaderProps {
  workOrderId: string;
}

export function InvoiceHeader({ workOrderId }: InvoiceHeaderProps) {
  const shortId = workOrderId.slice(0, 8);
  const currentDate = new Date();
  const dueDate = addDays(currentDate, 30);

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
        <p className="text-gray-600">#{shortId}</p>
      </div>
      
      <div className="text-right">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">AutoShop Pro</h2>
        <p className="text-gray-600 text-sm">123 Service Lane</p>
        <p className="text-gray-600 text-sm">Automotive City, AC 12345</p>
        <p className="text-gray-600 text-sm">(555) 123-4567</p>
      </div>
    </div>
  );
}
