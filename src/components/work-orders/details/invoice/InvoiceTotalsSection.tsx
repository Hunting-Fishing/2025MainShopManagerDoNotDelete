
import React from 'react';
import { WorkOrder } from '@/types/workOrder';

interface InvoiceTotalsSectionProps {
  workOrder: WorkOrder;
}

export function InvoiceTotalsSection({ workOrder }: InvoiceTotalsSectionProps) {
  const subtotal = workOrder.subtotal || workOrder.total_cost || 0;
  const taxRate = workOrder.tax_rate || 0;
  const taxAmount = workOrder.tax_amount || (subtotal * taxRate);
  const totalAmount = workOrder.total_amount || (subtotal + taxAmount);

  return (
    <div className="p-8 border-t border-gray-200">
      <div className="max-w-md ml-auto">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          {taxRate > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%):</span>
              <span className="font-medium">${taxAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
