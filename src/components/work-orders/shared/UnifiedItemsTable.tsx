
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onReorderJobLines?: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
  showType: "all" | "joblines" | "parts" | "overview";
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onReorderJobLines,
  isEditMode,
  showType
}: UnifiedItemsTableProps) {
  // Determine what to show based on showType
  const shouldShowJobLines = showType === "all" || showType === "joblines" || showType === "overview";
  const shouldShowParts = showType === "all" || showType === "parts" || showType === "overview";

  if (!shouldShowJobLines && !shouldShowParts) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No items to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shouldShowJobLines && jobLines.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Job Lines</h4>
          <div className="space-y-2">
            {jobLines.map((jobLine) => (
              <div key={jobLine.id} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{jobLine.name}</p>
                    {jobLine.description && (
                      <p className="text-sm text-muted-foreground">{jobLine.description}</p>
                    )}
                    <p className="text-sm">
                      Rate: ${jobLine.labor_rate}/hr | Hours: {jobLine.estimated_hours} | Total: ${jobLine.total_amount}
                    </p>
                  </div>
                  {isEditMode && (
                    <div className="flex gap-2">
                      {onJobLineUpdate && (
                        <button
                          onClick={() => onJobLineUpdate(jobLine)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                      )}
                      {onJobLineDelete && (
                        <button
                          onClick={() => onJobLineDelete(jobLine.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {shouldShowParts && allParts.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Parts</h4>
          <div className="space-y-2">
            {allParts.map((part) => (
              <div key={part.id} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{part.name}</p>
                    <p className="text-sm text-muted-foreground">Part #: {part.part_number}</p>
                    <p className="text-sm">
                      Qty: {part.quantity} | Price: ${part.unit_price} | Total: ${part.total_price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!shouldShowJobLines || jobLines.length === 0) && (!shouldShowParts || allParts.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No items to display
        </div>
      )}
    </div>
  );
}
