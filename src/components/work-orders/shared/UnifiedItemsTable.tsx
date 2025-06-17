
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { JobLineWithParts } from './JobLineWithParts';
import { UnassignedPartsSection } from '../parts/UnassignedPartsSection';

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

  // Get unassigned parts
  const unassignedParts = partsByJobLine['unassigned'] || [];

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
    // Show only unassigned parts
    return (
      <UnassignedPartsSection
        workOrderId={jobLines[0]?.work_order_id || ''}
        unassignedParts={unassignedParts}
        jobLines={jobLines}
        onPartUpdate={handlePartUpdate}
        onPartDelete={handlePartDelete}
        onPartAssigned={onPartsChange}
        isEditMode={isEditMode}
      />
    );
  }

  if (showType === "joblines" || showType === "all" || showType === "overview") {
    // Show job lines with their parts
    return (
      <div className="space-y-4">
        {/* Unassigned Parts Section - only show if there are unassigned parts or in "all" view */}
        {(showType === "all" || (unassignedParts.length > 0 && showType !== "overview")) && (
          <UnassignedPartsSection
            workOrderId={jobLines[0]?.work_order_id || ''}
            unassignedParts={unassignedParts}
            jobLines={jobLines}
            onPartUpdate={handlePartUpdate}
            onPartDelete={handlePartDelete}
            onPartAssigned={onPartsChange}
            isEditMode={isEditMode}
          />
        )}

        {/* Job Lines with Parts */}
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

        {jobLines.length === 0 && unassignedParts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No job lines or parts added yet</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
