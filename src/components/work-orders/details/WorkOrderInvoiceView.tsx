

import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { format, addDays } from 'date-fns';

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
}

export function WorkOrderInvoiceView({ workOrder, jobLines }: WorkOrderInvoiceViewProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
      {/* Header */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <p className="text-gray-600">#{workOrder.id.slice(0, 8)}</p>
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">AutoShop Pro</h2>
            <p className="text-gray-600 text-sm">123 Service Lane</p>
            <p className="text-gray-600 text-sm">Automotive City, AC 12345</p>
            <p className="text-gray-600 text-sm">(555) 123-4567</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <p className="text-gray-900 font-medium">{workOrder.customer || workOrder.customer_name}</p>
            <p className="text-gray-600 text-sm">{workOrder.customer_email}</p>
            <p className="text-gray-600 text-sm">{workOrder.customer_phone}</p>
          </div>
          
          <div className="text-right">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Issue Date:</span>
              <span className="text-gray-900">{format(new Date(), 'MMM dd, yyyy')}</span>
              
              <span className="text-gray-600">Due Date:</span>
              <span className="text-gray-900">{format(addDays(new Date(), 30), 'MMM dd, yyyy')}</span>
              
              <span className="text-gray-600">Work Order:</span>
              <span className="text-gray-900">#{workOrder.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        {workOrder.vehicle && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Vehicle Information</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Year:</span>
                <span className="ml-2 text-gray-900">{workOrder.vehicle.year}</span>
              </div>
              <div>
                <span className="text-gray-600">Make:</span>
                <span className="ml-2 text-gray-900">{workOrder.vehicle.make}</span>
              </div>
              <div>
                <span className="text-gray-600">Model:</span>
                <span className="ml-2 text-gray-900">{workOrder.vehicle.model}</span>
              </div>
              <div>
                <span className="text-gray-600">VIN:</span>
                <span className="ml-2 text-gray-900">{workOrder.vehicle.vin}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services/Job Lines */}
      <div className="p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Performed</h3>
        
        {jobLines && jobLines.length > 0 ? (
          <JobLinesGrid
            workOrderId={workOrder.id}
            jobLines={jobLines}
            showSummary={true}
            isEditMode={false}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No services recorded for this work order.
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="p-8 border-t border-gray-200">
        <div className="flex justify-end space-x-4">
          <div className="text-right">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">${workOrder.subtotal?.toFixed(2) || '0.00'}</span>
              
              <span className="text-gray-600">Tax ({(workOrder.tax_rate || 0) * 100}%):</span>
              <span className="text-gray-900">${workOrder.tax_amount?.toFixed(2) || '0.00'}</span>
            </div>
            
            <div className="mt-4">
              <span className="text-xl font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-gray-900 ml-2">${workOrder.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-8 bg-gray-50 text-center text-gray-600 text-sm">
        Invoice generated on {format(new Date(), 'MMM dd, yyyy')}
      </div>
    </div>
  );
}

