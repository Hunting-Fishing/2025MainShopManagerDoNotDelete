
import React from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';
import { updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  allParts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => void;
  isEditMode: boolean;
  showType: "all" | "joblines" | "parts" | "overview";
}

export function WorkOrderPartsSection({
  workOrderId,
  allParts,
  jobLines,
  onPartsChange,
  isEditMode,
  showType
}: WorkOrderPartsSectionProps) {
  const handlePartUpdate = async (updatedPart: WorkOrderPart) => {
    try {
      console.log('Updating part:', updatedPart);
      
      // Update in database
      await updateWorkOrderPart(updatedPart.id, updatedPart);
      
      // Trigger refresh
      onPartsChange();
      
      toast({
        title: "Success",
        description: "Part updated successfully",
      });
    } catch (error) {
      console.error('Error updating part:', error);
      toast({
        title: "Error",
        description: "Failed to update part",
        variant: "destructive"
      });
    }
  };

  const handlePartDelete = async (partId: string) => {
    try {
      console.log('Deleting part:', partId);
      
      // Delete from database
      await deleteWorkOrderPart(partId);
      
      // Trigger refresh
      onPartsChange();
      
      toast({
        title: "Success",
        description: "Part deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting part:', error);
      toast({
        title: "Error",
        description: "Failed to delete part",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Parts</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <UnifiedItemsTable
          jobLines={jobLines}
          allParts={allParts}
          onPartUpdate={isEditMode ? handlePartUpdate : undefined}
          onPartDelete={isEditMode ? handlePartDelete : undefined}
          isEditMode={isEditMode}
          showType={showType}
        />
      </CardContent>
    </Card>
  );
}
