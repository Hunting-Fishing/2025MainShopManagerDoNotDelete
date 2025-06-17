
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { ItemsTableHeader } from './ItemsTableHeader';
import { ItemsTableRow } from './ItemsTableRow';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => Promise<void>;
  onJobLineDelete?: (jobLineId: string) => Promise<void>;
  onPartUpdate?: (part: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
  onReorderParts?: (parts: WorkOrderPart[]) => void;
  isEditMode?: boolean;
  showType: 'overview' | 'labor' | 'parts';
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode = false,
  showType
}: UnifiedItemsTableProps) {
  const showJobLines = showType === 'overview' || showType === 'labor';
  const showParts = showType === 'overview' || showType === 'parts';

  const handleJobLineUpdate = async (item: WorkOrderJobLine | WorkOrderPart) => {
    if (onJobLineUpdate && 'estimated_hours' in item) {
      await onJobLineUpdate(item as WorkOrderJobLine);
    }
  };

  const handlePartUpdate = async (item: WorkOrderJobLine | WorkOrderPart) => {
    if (onPartUpdate && 'quantity' in item) {
      await onPartUpdate(item as WorkOrderPart);
    }
  };

  const handleJobLineDelete = async (id: string) => {
    if (onJobLineDelete) {
      await onJobLineDelete(id);
    }
  };

  const handlePartDelete = async (id: string) => {
    if (onPartDelete) {
      await onPartDelete(id);
    }
  };

  if (!showJobLines && !showParts) {
    return null;
  }

  const hasItems = (showJobLines && jobLines.length > 0) || (showParts && allParts.length > 0);

  if (!hasItems) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No {showType === 'labor' ? 'labor items' : showType === 'parts' ? 'parts' : 'items'} found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ItemsTableHeader 
        showType={showType}
        isEditMode={isEditMode}
      />
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Item</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
              {showType === 'labor' && (
                <>
                  <th className="px-4 py-3 text-right text-sm font-medium">Hours</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Rate</th>
                </>
              )}
              {showType === 'parts' && (
                <>
                  <th className="px-4 py-3 text-center text-sm font-medium">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
                </>
              )}
              {showType === 'overview' && (
                <>
                  <th className="px-4 py-3 text-center text-sm font-medium">Hours/Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Rate/Price</th>
                </>
              )}
              <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
              {isEditMode && (
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {showJobLines && jobLines.map((jobLine) => (
              <ItemsTableRow
                key={jobLine.id}
                item={jobLine}
                type="jobLine"
                isEditMode={isEditMode}
                onUpdate={handleJobLineUpdate}
                onDelete={handleJobLineDelete}
              />
            ))}
            {showParts && allParts.map((part) => (
              <ItemsTableRow
                key={part.id}
                item={part}
                type="part"
                isEditMode={isEditMode}
                onUpdate={handlePartUpdate}
                onDelete={handlePartDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
