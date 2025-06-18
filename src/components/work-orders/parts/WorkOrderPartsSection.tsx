
import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';
import { AddPartDialog } from './AddPartDialog';
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
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [partsFilter, setPartsFilter] = useState<"all" | "unassigned">("all");

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

  // Only show the card wrapper for non-overview views
  if (showType === "overview") {
    return (
      <UnifiedItemsTable
        jobLines={jobLines}
        allParts={allParts}
        onPartUpdate={isEditMode ? handlePartUpdate : undefined}
        onPartDelete={isEditMode ? handlePartDelete : undefined}
        onPartsChange={onPartsChange}
        isEditMode={isEditMode}
        showType={showType}
      />
    );
  }

  // Get counts for filter buttons
  const totalPartsCount = allParts.length;
  const unassignedPartsCount = allParts.filter(part => !part.job_line_id).length;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {showType === "parts" ? "Parts" : "Parts & Job Lines"}
            </CardTitle>
            <div className="flex items-center gap-2">
              {showType === "parts" && (
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={partsFilter === "all" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setPartsFilter("all")}
                  >
                    All Parts ({totalPartsCount})
                  </Button>
                  <Button
                    variant={partsFilter === "unassigned" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setPartsFilter("unassigned")}
                  >
                    Unassigned ({unassignedPartsCount})
                  </Button>
                </div>
              )}
              {isEditMode && (
                <Button size="sm" className="h-8 px-3" onClick={() => setShowAddPartDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <UnifiedItemsTable
            jobLines={jobLines}
            allParts={allParts}
            onPartUpdate={isEditMode ? handlePartUpdate : undefined}
            onPartDelete={isEditMode ? handlePartDelete : undefined}
            onPartsChange={onPartsChange}
            isEditMode={isEditMode}
            showType={showType === "parts" ? partsFilter : showType}
            partsFilter={showType === "parts" ? partsFilter : undefined}
          />
        </CardContent>
      </Card>

      <AddPartDialog
        isOpen={showAddPartDialog}
        onClose={() => setShowAddPartDialog(false)}
        workOrderId={workOrderId}
        jobLines={jobLines}
        onPartAdded={onPartsChange}
      />
    </>
  );
}
