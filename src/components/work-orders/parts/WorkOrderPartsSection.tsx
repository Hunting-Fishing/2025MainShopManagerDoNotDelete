
import React from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartsManager } from './WorkOrderPartsManager';
import { useWorkOrderPartsData } from '@/hooks/useWorkOrderPartsData';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  parts: initialParts,
  jobLines,
  onPartsChange,
  isEditMode = false
}: WorkOrderPartsSectionProps) {
  const { parts: liveParts, isLoading, error, refreshParts } = useWorkOrderPartsData(workOrderId);
  
  // Use live parts if available, otherwise fall back to initial parts
  const displayParts = liveParts.length > 0 ? liveParts : initialParts;

  console.log('WorkOrderPartsSection render:', { 
    workOrderId, 
    isEditMode, 
    partsCount: displayParts.length,
    jobLinesCount: jobLines.length,
    isLoading,
    error
  });

  const handlePartsChange = async () => {
    console.log('Parts changed, refreshing both live and parent data...');
    await Promise.all([
      refreshParts(),
      onPartsChange()
    ]);
  };

  return (
    <WorkOrderPartsManager
      workOrderId={workOrderId}
      parts={displayParts}
      jobLines={jobLines}
      onPartsChange={handlePartsChange}
      isEditMode={isEditMode}
      isLoading={isLoading}
      error={error}
    />
  );
}
