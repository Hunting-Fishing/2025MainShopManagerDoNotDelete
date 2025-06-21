
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { AddPartDialog } from './AddPartDialog';
import { updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { PartsList } from './PartsList';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false
}: WorkOrderPartsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handlePartAdded = async () => {
    console.log('Part added successfully');
    await onPartsChange();
  };

  const handlePartUpdate = async (partId: string, updates: Partial<WorkOrderPart>) => {
    try {
      await updateWorkOrderPart(partId, updates);
      await onPartsChange();
    } catch (error) {
      console.error('Error updating part:', error);
    }
  };

  const handlePartDelete = async (partId: string) => {
    try {
      await deleteWorkOrderPart(partId);
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Parts & Materials</CardTitle>
          {isEditMode && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Part
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <PartsList
            parts={parts}
            jobLines={jobLines}
            onPartUpdate={handlePartUpdate}
            onPartDelete={handlePartDelete}
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>

      <AddPartDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        workOrderId={workOrderId}
        jobLines={jobLines}
        onPartAdded={handlePartAdded}
      />
    </>
  );
}
