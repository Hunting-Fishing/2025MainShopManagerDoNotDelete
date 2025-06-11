
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';

interface InvoiceServicesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
}

export function InvoiceServicesSection({ workOrderId, jobLines }: InvoiceServicesSectionProps) {
  const calculateSubtotal = () => {
    const laborTotal = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
    const partsTotal = jobLines.reduce((sum, line) => {
      if (line.parts) {
        return sum + line.parts.reduce((partSum, part) => partSum + part.total_price, 0);
      }
      return sum;
    }, 0);
    return laborTotal + partsTotal;
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Services & Parts</h3>
      
      {jobLines.map((jobLine) => (
        <div key={jobLine.id} className="border-b py-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium">{jobLine.name}</h4>
              {jobLine.description && (
                <p className="text-sm text-gray-600">{jobLine.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {jobLine.estimated_hours || 0} hrs @ ${jobLine.labor_rate || 0}/hr
              </div>
              <div className="font-medium">
                ${jobLine.total_amount || 0}
              </div>
            </div>
          </div>
          
          {jobLine.parts && jobLine.parts.length > 0 && (
            <div className="ml-4 mt-2">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Parts:</h5>
              {jobLine.parts.map((part) => (
                <div key={part.id} className="flex justify-between text-sm">
                  <span>{part.name} (Qty: {part.quantity})</span>
                  <span>${part.total_price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-lg font-semibold">
          <span>Subtotal:</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
