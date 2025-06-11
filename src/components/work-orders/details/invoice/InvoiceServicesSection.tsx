
import React, { useState, useEffect } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getJobLineParts } from '@/services/workOrder/workOrderPartsService';

interface InvoiceServicesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
}

export function InvoiceServicesSection({ workOrderId, jobLines }: InvoiceServicesSectionProps) {
  const [jobLinesWithParts, setJobLinesWithParts] = useState<WorkOrderJobLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartsForJobLines = async () => {
      console.log('Loading parts for job lines:', jobLines);
      try {
        setLoading(true);
        const jobLinesWithPartsData = await Promise.all(
          jobLines.map(async (jobLine) => {
            try {
              const parts = await getJobLineParts(jobLine.id);
              console.log(`Parts for job line ${jobLine.id}:`, parts);
              return { ...jobLine, parts };
            } catch (error) {
              console.error(`Error loading parts for job line ${jobLine.id}:`, error);
              return { ...jobLine, parts: [] };
            }
          })
        );
        setJobLinesWithParts(jobLinesWithPartsData);
      } catch (error) {
        console.error('Error loading parts for job lines:', error);
        setJobLinesWithParts(jobLines.map(jl => ({ ...jl, parts: [] })));
      } finally {
        setLoading(false);
      }
    };

    if (jobLines.length > 0) {
      loadPartsForJobLines();
    } else {
      setLoading(false);
    }
  }, [jobLines]);

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Services & Parts</h2>
        <div className="text-center py-4">Loading services and parts...</div>
      </div>
    );
  }

  const calculateJobLineTotal = (jobLine: WorkOrderJobLine) => {
    const laborTotal = jobLine.totalAmount || 0;
    const partsTotal = (jobLine.parts || []).reduce((total, part) => 
      total + (part.customerPrice * part.quantity), 0);
    return laborTotal + partsTotal;
  };

  const grandTotal = jobLinesWithParts.reduce((total, jobLine) => 
    total + calculateJobLineTotal(jobLine), 0);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-6">Services & Parts</h2>
      
      {jobLinesWithParts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No services or parts found for this work order.
        </div>
      ) : (
        <div className="space-y-6">
          {jobLinesWithParts.map((jobLine) => (
            <div key={jobLine.id} className="border rounded-lg p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-lg">{jobLine.name}</h3>
                {jobLine.description && (
                  <p className="text-gray-600 text-sm mt-1">{jobLine.description}</p>
                )}
                <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                  <div>
                    <span className="font-medium">Hours:</span> {jobLine.estimatedHours || 0}
                  </div>
                  <div>
                    <span className="font-medium">Rate:</span> ${(jobLine.laborRate || 0).toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Labor:</span> ${(jobLine.totalAmount || 0).toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> ${calculateJobLineTotal(jobLine).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Parts Section */}
              {jobLine.parts && jobLine.parts.length > 0 ? (
                <div className="mt-4 border-t pt-3">
                  <h4 className="font-medium text-gray-700 mb-2">Parts ({jobLine.parts.length})</h4>
                  <div className="space-y-2">
                    {jobLine.parts.map((part) => (
                      <div key={part.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium">{part.partName}</h5>
                            {part.partNumber && (
                              <p className="text-xs text-gray-500">Part #: {part.partNumber}</p>
                            )}
                            {part.supplierName && (
                              <p className="text-xs text-gray-500">Supplier: {part.supplierName}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              Qty: {part.quantity} × ${part.customerPrice.toFixed(2)}
                            </div>
                            <div className="font-medium">
                              ${(part.quantity * part.customerPrice).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 border-t pt-3">
                  <p className="text-gray-500 text-sm">No parts added yet</p>
                </div>
              )}
            </div>
          ))}

          {/* Grand Total */}
          <div className="border-t-2 pt-4">
            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-lg font-bold">
                  Grand Total: ${grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
