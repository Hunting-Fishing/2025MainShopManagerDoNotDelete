
import React, { useState, useEffect } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getWorkOrderParts, updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';
import { toast } from '@/hooks/use-toast';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({ 
  workOrderId, 
  isEditMode = false 
}: WorkOrderPartsSectionProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      if (!workOrderId) return;
      
      try {
        setIsLoading(true);
        const partsData = await getWorkOrderParts(workOrderId);
        setParts(partsData);
      } catch (error) {
        console.error('Error fetching work order parts:', error);
        setParts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParts();
  }, [workOrderId]);

  const handlePartUpdate = async (updatedPart: WorkOrderPart) => {
    try {
      console.log('Updating part:', updatedPart);
      
      // Update in database
      await updateWorkOrderPart(updatedPart.id, updatedPart);
      
      // Update local state
      const updatedParts = parts.map(part => 
        part.id === updatedPart.id ? updatedPart : part
      );
      setParts(updatedParts);
      
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
      
      // Update local state
      const updatedParts = parts.filter(part => part.id !== partId);
      setParts(updatedParts);
      
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

  const handlePartsReorder = async (reorderedParts: WorkOrderPart[]) => {
    try {
      console.log('Reordering parts');
      
      // For parts, we might not have a display_order field, so just update local state
      setParts(reorderedParts);
      
      toast({
        title: "Success",
        description: "Parts reordered successfully",
      });
    } catch (error) {
      console.error('Error reordering parts:', error);
      toast({
        title: "Error", 
        description: "Failed to reorder parts",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Parts & Inventory</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Loading parts...
          </div>
        ) : (
          <UnifiedItemsTable
            jobLines={[]}
            allParts={parts}
            onPartUpdate={isEditMode ? handlePartUpdate : undefined}
            onPartDelete={isEditMode ? handlePartDelete : undefined}
            onReorderParts={isEditMode ? handlePartsReorder : undefined}
            isEditMode={isEditMode}
            showType="parts"
          />
        )}
      </CardContent>
    </Card>
  );
}
