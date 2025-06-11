
import React from 'react';
import { WorkOrder } from '@/types/workOrder';

interface InvoiceCustomerInfoProps {
  workOrder: WorkOrder;
}

export function InvoiceCustomerInfo({ workOrder }: InvoiceCustomerInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-8 mb-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
        <div className="text-gray-700">
          <p className="font-medium">{workOrder.customer_name || 'N/A'}</p>
          {workOrder.customer_email && <p>{workOrder.customer_email}</p>}
          {workOrder.customer_phone && <p>{workOrder.customer_phone}</p>}
          {workOrder.customer_address && (
            <div>
              <p>{workOrder.customer_address}</p>
              {(workOrder.customer_city || workOrder.customer_state || workOrder.customer_zip) && (
                <p>
                  {workOrder.customer_city && `${workOrder.customer_city}, `}
                  {workOrder.customer_state && `${workOrder.customer_state} `}
                  {workOrder.customer_zip}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Service Provider:</h3>
        <div className="text-gray-700">
          <p className="font-medium">{workOrder.company_name || 'Auto Service Shop'}</p>
          {workOrder.company_address && <p>{workOrder.company_address}</p>}
          {(workOrder.company_city || workOrder.company_state || workOrder.company_zip) && (
            <p>
              {workOrder.company_city && `${workOrder.company_city}, `}
              {workOrder.company_state && `${workOrder.company_state} `}
              {workOrder.company_zip}
            </p>
          )}
          {workOrder.company_phone && <p>{workOrder.company_phone}</p>}
          {workOrder.company_email && <p>{workOrder.company_email}</p>}
        </div>
      </div>
    </div>
  );
}
