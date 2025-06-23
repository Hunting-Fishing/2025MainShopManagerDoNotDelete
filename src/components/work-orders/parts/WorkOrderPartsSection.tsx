
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { PartsList } from './PartsList';
import { AddPartButton } from './AddPartButton';
import { useWorkOrderPartsData } from '@/hooks/useWorkOrderPartsData';
import { toast } from 'sonner';

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

  const handlePartAdded = async () => {
    console.log('Part added, refreshing parts and parent data...');
    await Promise.all([
      refreshParts(),
      onPartsChange()
    ]);
  };

  const handlePartUpdate = async (partId: string, updates: Partial<WorkOrderPart>) => {
    try {
      console.log('Updating part:', partId, updates);
      await updateWorkOrderPart(partId, updates);
      await handlePartAdded();
      toast.success('Part updated successfully');
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    }
  };

  const handlePartDelete = async (partId: string) => {
    try {
      console.log('Deleting part:', partId);
      await deleteWorkOrderPart(partId);
      await handlePartAdded();
      toast.success('Part deleted successfully');
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parts & Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load parts: {error}
              <button 
                onClick={refreshParts}
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Parts & Materials
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span className="text-sm font-normal text-muted-foreground">
            ({displayParts.length})
          </span>
        </CardTitle>
        
        <AddPartButton
          workOrderId={workOrderId}
          jobLines={jobLines}
          onPartAdded={handlePartAdded}
          isEditMode={isEditMode}
          disabled={isLoading}
        />
      </CardHeader>
      <CardContent>
        <PartsList
          parts={displayParts}
          jobLines={jobLines}
          onPartUpdate={handlePartUpdate}
          onPartDelete={handlePartDelete}
          isEditMode={isEditMode}
        />
      </CardContent>
    </Card>
  );
}
