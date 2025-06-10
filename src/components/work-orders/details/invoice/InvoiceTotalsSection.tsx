
import React from 'react';
import { WorkOrder } from '@/types/workOrder';

interface InvoiceTotalsSectionProps {
  workOrder: WorkOrder;
}

export function InvoiceTotalsSection({ workOrder }: InvoiceTotalsSectionProps) {
  const subtotal = workOrder.subtotal || 0;
  const taxRate = workOrder.tax_rate || 0;
  const taxAmount = workOrder.tax_amount || 0;
  const totalAmount = workOrder.total_amount || 0;

  return (
    <div className="p-8 border-t border-gray-200">
      <div className="flex justify-end space-x-4">
        <div className="text-right">
          <InvoiceSubtotals 
            subtotal={subtotal}
            taxRate={taxRate}
            taxAmount={taxAmount}
          />
          <InvoiceTotal totalAmount={totalAmount} />
        </div>
      </div>
    </div>
  );
}

interface InvoiceSubtotalsProps {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
}

function InvoiceSubtotals({ subtotal, taxRate, taxAmount }: InvoiceSubtotalsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <span className="text-gray-600">Subtotal:</span>
      <span className="text-gray-900">${subtotal.toFixed(2)}</span>
      
      <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%):</span>
      <span className="text-gray-900">${taxAmount.toFixed(2)}</span>
    </div>
  );
}

interface InvoiceTotalProps {
  totalAmount: number;
}

function InvoiceTotal({ totalAmount }: InvoiceTotalProps) {
  return (
    <div className="mt-4">
      <span className="text-xl font-semibold text-gray-900">Total:</span>
      <span className="text-xl font-bold text-gray-900 ml-2">${totalAmount.toFixed(2)}</span>
    </div>
  );
}
