
import React from 'react';
import { WorkOrder } from '@/types/workOrder';

interface InvoiceTotalsSectionProps {
  workOrder: WorkOrder;
}

export function InvoiceTotalsSection({ workOrder }: InvoiceTotalsSectionProps) {
  return (
    <div className="p-6 bg-gray-50">
      <div className="text-right">
        <div className="text-xl font-bold">
          Total: ${workOrder.total_cost || '0.00'}
        </div>
      </div>
    </div>
  );
}
