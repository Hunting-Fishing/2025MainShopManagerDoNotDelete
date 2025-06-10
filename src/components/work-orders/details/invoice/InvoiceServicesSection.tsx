
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLinesGrid } from '../../job-lines/JobLinesGrid';

interface InvoiceServicesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
}

export function InvoiceServicesSection({ workOrderId, jobLines }: InvoiceServicesSectionProps) {
  return (
    <div className="p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Performed</h3>
      
      {jobLines && jobLines.length > 0 ? (
        <JobLinesGrid
          workOrderId={workOrderId}
          jobLines={jobLines}
          showSummary={true}
          isEditMode={false}
        />
      ) : (
        <EmptyServicesMessage />
      )}
    </div>
  );
}

function EmptyServicesMessage() {
  return (
    <div className="text-center py-8 text-gray-500">
      No services recorded for this work order.
    </div>
  );
}
