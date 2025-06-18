
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { updateWorkOrderJobLine, deleteWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';
import { toast } from '@/hooks/use-toast';

interface JobLinesSectionProps {
  workOrderId: string;
  description?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
  shopId?: string;
  showType?: "all" | "joblines" | "parts" | "overview";
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  isEditMode,
  shopId,
  showType = "joblines"
}: JobLinesSectionProps) {
  const handleJobLineDelete = async (jobLineId: string) => {
    try {
      console.log('Deleting job line:', jobLineId);
      
      // Delete from database
      await deleteWorkOrderJobLine(jobLineId);
      
      // Update local state
      const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
      onJobLinesChange(updatedJobLines);
      
      toast({
        title: "Success",
        description: "Job line deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting job line:', error);
      toast({
        title: "Error",
        description: "Failed to delete job line",
        variant: "destructive"
      });
    }
  };

  const handleJobLineUpdate = async (updatedJobLine: WorkOrderJobLine) => {
    try {
      console.log('Updating job line:', updatedJobLine);
      
      // Update in database
      await updateWorkOrderJobLine(updatedJobLine.id, updatedJobLine);
      
      // Update local state
      const updatedJobLines = jobLines.map(line => 
        line.id === updatedJobLine.id ? updatedJobLine : line
      );
      onJobLinesChange(updatedJobLines);
      
      toast({
        title: "Success",
        description: "Job line updated successfully",
      });
    } catch (error) {
      console.error('Error updating job line:', error);
      toast({
        title: "Error",
        description: "Failed to update job line",
        variant: "destructive"
      });
    }
  };

  const handleJobLinesReorder = async (reorderedJobLines: WorkOrderJobLine[]) => {
    try {
      console.log('Reordering job lines');
      
      // Update display_order for each job line
      const updatePromises = reorderedJobLines.map((line, index) => 
        updateWorkOrderJobLine(line.id, { ...line, display_order: index })
      );
      
      await Promise.all(updatePromises);
      onJobLinesChange(reorderedJobLines);
      
      toast({
        title: "Success", 
        description: "Job lines reordered successfully",
      });
    } catch (error) {
      console.error('Error reordering job lines:', error);
      toast({
        title: "Error",
        description: "Failed to reorder job lines",
        variant: "destructive"
      });
    }
  };

  const handlePartsChange = () => {
    // Refresh job lines to get updated parts
    console.log('Parts changed, refreshing job lines...');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Job Lines (Labor)</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Job Line
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <UnifiedItemsTable
          jobLines={jobLines}
          allParts={[]}
          workOrderId={workOrderId}
          onJobLineUpdate={isEditMode ? handleJobLineUpdate : undefined}
          onJobLineDelete={isEditMode ? handleJobLineDelete : undefined}
          onReorderJobLines={isEditMode ? handleJobLinesReorder : undefined}
          onPartsChange={handlePartsChange}
          isEditMode={isEditMode}
          showType={showType}
        />
      </CardContent>
    </Card>
  );
}
