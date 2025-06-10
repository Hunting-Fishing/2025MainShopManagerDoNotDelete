
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { InvoiceHeader } from './invoice/InvoiceHeader';
import { InvoiceCustomerInfo } from './invoice/InvoiceCustomerInfo';
import { InvoiceVehicleInfo } from './invoice/InvoiceVehicleInfo';
import { InvoiceServicesSection } from './invoice/InvoiceServicesSection';
import { InvoiceTotalsSection } from './invoice/InvoiceTotalsSection';
import { InvoiceFooter } from './invoice/InvoiceFooter';

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
}

export function WorkOrderInvoiceView({ workOrder, jobLines }: WorkOrderInvoiceViewProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
      <div className="p-8 border-b border-gray-200">
        <InvoiceHeader workOrderId={workOrder.id} />
        <InvoiceCustomerInfo workOrder={workOrder} />
        <InvoiceVehicleInfo vehicle={workOrder.vehicle} />
      </div>

      <InvoiceServicesSection 
        workOrderId={workOrder.id}
        jobLines={jobLines} 
      />

      <InvoiceTotalsSection workOrder={workOrder} />

      <InvoiceFooter />
    </div>
  );
}
