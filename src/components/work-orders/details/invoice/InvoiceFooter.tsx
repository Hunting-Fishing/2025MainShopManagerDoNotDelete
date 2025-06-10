
import React from 'react';
import { format } from 'date-fns';

export function InvoiceFooter() {
  const currentDate = new Date();
  
  return (
    <div className="p-8 bg-gray-50 text-center text-gray-600 text-sm">
      Invoice generated on {format(currentDate, 'MMM dd, yyyy')}
    </div>
  );
}
