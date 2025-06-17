
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { JobLineWithParts } from './JobLineWithParts';
import { AddPartDialog } from '../parts/AddPartDialog';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onReorderJobLines?: (jobLines: WorkOrderJobLine[]) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode: boolean;
  showType: "all" | "joblines" | "parts" | "overview";
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onReorderJobLines,
  onPartUpdate,
  onPartDelete,
  isEditMode,
  showType
}: UnifiedItemsTableProps) {
  const [selectedJobLineId, setSelectedJobLineId] = useState<string>('');
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);

  // Determine what to show based on showType
  const shouldShowJobLines = showType === "all" || showType === "joblines" || showType === "overview";
  const shouldShowParts = showType === "all" || showType === "parts" || showType === "overview";

  // Group parts by job line
  const groupPartsByJobLine = (parts: WorkOrderPart[]) => {
    return parts.reduce((groups, part) => {
      const jobLineId = part.job_line_id || 'unassigned';
      if (!groups[jobLineId]) {
        groups[jobLineId] = [];
      }
      groups[jobLineId].push(part);
      return groups;
    }, {} as Record<string, WorkOrderPart[]>);
  };

  const partsByJobLine = groupPartsByJobLine(allParts);
  const unassignedParts = partsByJobLine['unassigned'] || [];

  const handleAddPart = (jobLineId: string) => {
    setSelectedJobLineId(jobLineId);
    setShowAddPartDialog(true);
  };

  const handlePartAdded = (part: WorkOrderPart) => {
    // The parent component should handle refresing the data
    // This is just to close the dialog
    setShowAddPartDialog(false);
    setSelectedJobLineId('');
  };

  if (!shouldShowJobLines && !shouldShowParts) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No items to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show job lines with their attached parts in hierarchical view */}
      {shouldShowJobLines && showType === "overview" && (
        <div>
          {jobLines.length > 0 ? (
            <div className="space-y-4">
              {jobLines.map((jobLine) => {
                const attachedParts = partsByJobLine[jobLine.id] || [];
                return (
                  <JobLineWithParts
                    key={jobLine.id}
                    jobLine={jobLine}
                    attachedParts={attachedParts}
                    onJobLineUpdate={onJobLineUpdate}
                    onJobLineDelete={onJobLineDelete}
                    onPartUpdate={onPartUpdate}
                    onPartDelete={onPartDelete}
                    onAddPart={handleAddPart}
                    isEditMode={isEditMode}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No job lines added yet</p>
            </div>
          )}
        </div>
      )}

      {/* Show separate sections for non-overview tabs */}
      {shouldShowJobLines && showType !== "overview" && jobLines.length > 0 && (
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

      {shouldShowParts && showType !== "overview" && allParts.length > 0 && (
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
                    {part.job_line_id && (
                      <p className="text-xs text-muted-foreground">
                        Attached to: {jobLines.find(jl => jl.id === part.job_line_id)?.name || 'Unknown Job Line'}
                      </p>
                    )}
                  </div>
                  {isEditMode && (
                    <div className="flex gap-2">
                      {onPartUpdate && (
                        <button
                          onClick={() => onPartUpdate(part)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                      )}
                      {onPartDelete && (
                        <button
                          onClick={() => onPartDelete(part.id)}
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

      {/* Show unassigned parts if any exist */}
      {unassignedParts.length > 0 && showType === "overview" && (
        <div className="mt-6">
          <h4 className="font-medium mb-2 text-orange-600">Unassigned Parts</h4>
          <div className="space-y-2">
            {unassignedParts.map((part) => (
              <div key={part.id} className="border border-orange-200 rounded p-3 bg-orange-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{part.name}</p>
                    <p className="text-sm text-muted-foreground">Part #: {part.part_number}</p>
                    <p className="text-sm">
                      Qty: {part.quantity} | Price: ${part.unit_price} | Total: ${part.total_price}
                    </p>
                    <p className="text-xs text-orange-600">This part is not assigned to any job line</p>
                  </div>
                  {isEditMode && (
                    <div className="flex gap-2">
                      {onPartUpdate && (
                        <button
                          onClick={() => onPartUpdate(part)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                      )}
                      {onPartDelete && (
                        <button
                          onClick={() => onPartDelete(part.id)}
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

      {(!shouldShowJobLines || jobLines.length === 0) && (!shouldShowParts || allParts.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No items to display
        </div>
      )}

      {/* Add Part Dialog */}
      {showAddPartDialog && selectedJobLineId && (
        <AddPartDialog
          open={showAddPartDialog}
          onOpenChange={setShowAddPartDialog}
          workOrderId={jobLines.find(jl => jl.id === selectedJobLineId)?.work_order_id || ''}
          jobLineId={selectedJobLineId}
          onPartAdded={handlePartAdded}
        />
      )}
    </div>
  );
}
