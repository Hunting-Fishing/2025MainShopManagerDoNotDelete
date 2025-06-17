
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { JobLineWithParts } from './JobLineWithParts';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (updatedJobLine: WorkOrderJobLine) => Promise<void>;
  onJobLineDelete?: (jobLineId: string) => Promise<void>;
  onReorderJobLines?: (reorderedJobLines: WorkOrderJobLine[]) => Promise<void>;
  onPartUpdate?: (updatedPart: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
  onPartsChange?: () => void;
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
  onPartsChange,
  isEditMode,
  showType
}: UnifiedItemsTableProps) {
  // Group parts by job line
  const partsByJobLine = allParts.reduce((acc, part) => {
    const jobLineId = part.job_line_id || 'unassigned';
    if (!acc[jobLineId]) {
      acc[jobLineId] = [];
    }
    acc[jobLineId].push(part);
    return acc;
  }, {} as Record<string, WorkOrderPart[]>);

  const handlePartUpdate = async (updatedPart: WorkOrderPart) => {
    if (onPartUpdate) {
      await onPartUpdate(updatedPart);
      if (onPartsChange) {
        onPartsChange();
      }
    }
  };

  const handlePartDelete = async (partId: string) => {
    if (onPartDelete) {
      await onPartDelete(partId);
      if (onPartsChange) {
        onPartsChange();
      }
    }
  };

  if (showType === "parts") {
    // Show only parts
    const unassignedParts = partsByJobLine['unassigned'] || [];
    return (
      <div className="space-y-4">
        {unassignedParts.map((part) => (
          <div key={part.id} className="border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{part.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Part #{part.part_number} • Qty: {part.quantity} • ${part.unit_price}
                </p>
                {part.description && (
                  <p className="text-sm text-muted-foreground mt-1">{part.description}</p>
                )}
              </div>
              {isEditMode && (
                <div className="flex gap-2">
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={() => {/* Edit part logic */}}
                  >
                    Edit
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800 text-sm"
                    onClick={() => handlePartDelete(part.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {unassignedParts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No parts added yet</p>
          </div>
        )}
      </div>
    );
  }

  if (showType === "joblines" || showType === "all" || showType === "overview") {
    // Show job lines with their parts
    return (
      <div className="space-y-4">
        {jobLines.map((jobLine) => {
          const jobLineParts = partsByJobLine[jobLine.id] || [];
          return (
            <JobLineWithParts
              key={jobLine.id}
              jobLine={jobLine}
              jobLineParts={jobLineParts}
              onPartUpdate={handlePartUpdate}
              onPartDelete={handlePartDelete}
              onPartsChange={onPartsChange || (() => {})}
              isEditMode={isEditMode}
            />
          );
        })}
        
        {/* Show unassigned parts if showType is "all" */}
        {showType === "all" && partsByJobLine['unassigned']?.length > 0 && (
          <JobLineWithParts
            key="unassigned"
            jobLine={{
              id: 'unassigned',
              work_order_id: '',
              name: 'Unassigned Parts',
              created_at: '',
              updated_at: ''
            }}
            jobLineParts={partsByJobLine['unassigned']}
            onPartUpdate={handlePartUpdate}
            onPartDelete={handlePartDelete}
            onPartsChange={onPartsChange || (() => {})}
            isEditMode={isEditMode}
          />
        )}

        {jobLines.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No job lines added yet</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
