
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { JobLineWithParts } from './JobLineWithParts';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode?: boolean;
  showType: "all" | "joblines" | "parts" | "overview";
  onPartsChange?: () => void;
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onPartUpdate,
  onPartDelete,
  isEditMode = false,
  showType,
  onPartsChange
}: UnifiedItemsTableProps) {
  // Group parts by job line
  const partsByJobLine = React.useMemo(() => {
    const grouped: { [key: string]: WorkOrderPart[] } = {};
    
    allParts.forEach(part => {
      const jobLineId = part.job_line_id || 'unassigned';
      if (!grouped[jobLineId]) {
        grouped[jobLineId] = [];
      }
      grouped[jobLineId].push(part);
    });
    
    return grouped;
  }, [allParts]);

  const handlePartUpdate = async (updatedPart: WorkOrderPart) => {
    if (onPartUpdate) {
      await onPartUpdate(updatedPart);
    }
    // Trigger refresh after update
    if (onPartsChange) {
      onPartsChange();
    }
  };

  const handlePartDelete = async (partId: string) => {
    if (onPartDelete) {
      await onPartDelete(partId);
    }
    // Trigger refresh after delete
    if (onPartsChange) {
      onPartsChange();
    }
  };

  if (showType === "overview") {
    return (
      <div className="space-y-4">
        {jobLines.map((jobLine) => (
          <JobLineWithParts
            key={jobLine.id}
            jobLine={jobLine}
            parts={partsByJobLine[jobLine.id] || []}
            onPartUpdate={isEditMode ? handlePartUpdate : undefined}
            onPartDelete={isEditMode ? handlePartDelete : undefined}
            onPartsChange={onPartsChange}
            isEditMode={isEditMode}
          />
        ))}
        
        {/* Show unassigned parts if any */}
        {partsByJobLine['unassigned'] && partsByJobLine['unassigned'].length > 0 && (
          <JobLineWithParts
            key="unassigned"
            jobLine={{
              id: 'unassigned',
              work_order_id: '',
              name: 'Unassigned Parts',
              created_at: '',
              updated_at: ''
            }}
            parts={partsByJobLine['unassigned']}
            onPartUpdate={isEditMode ? handlePartUpdate : undefined}
            onPartDelete={isEditMode ? handlePartDelete : undefined}
            onPartsChange={onPartsChange}
            isEditMode={isEditMode}
          />
        )}
      </div>
    );
  }

  // For other views, show simplified table
  if (showType === "parts") {
    return (
      <div className="space-y-2">
        {allParts.map((part) => (
          <div key={part.id} className="border rounded p-3 bg-card">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{part.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Part #: {part.part_number}
                </p>
                <p className="text-sm">
                  Qty: {part.quantity} × ${part.unit_price} = ${part.total_price}
                </p>
              </div>
              {isEditMode && (
                <div className="flex gap-2">
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={() => handlePartUpdate(part)}
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
      </div>
    );
  }

  if (showType === "joblines") {
    return (
      <div className="space-y-2">
        {jobLines.map((jobLine) => (
          <div key={jobLine.id} className="border rounded p-3 bg-card">
            <h4 className="font-medium">{jobLine.name}</h4>
            {jobLine.description && (
              <p className="text-sm text-muted-foreground">{jobLine.description}</p>
            )}
            <div className="text-sm">
              <span>Hours: {jobLine.estimated_hours || 0}</span>
              {jobLine.labor_rate && (
                <span className="ml-4">Rate: ${jobLine.labor_rate}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default "all" view
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Job Lines</h3>
        <div className="space-y-2">
          {jobLines.map((jobLine) => (
            <div key={jobLine.id} className="border rounded p-3 bg-card">
              <h4 className="font-medium">{jobLine.name}</h4>
              {jobLine.description && (
                <p className="text-sm text-muted-foreground">{jobLine.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Parts</h3>
        <div className="space-y-2">
          {allParts.map((part) => (
            <div key={part.id} className="border rounded p-3 bg-card">
              <h4 className="font-medium">{part.name}</h4>
              <p className="text-sm text-muted-foreground">
                Part #: {part.part_number} | Qty: {part.quantity}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
