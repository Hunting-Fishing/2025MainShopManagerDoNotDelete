
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { AddJobLineDialog } from '../job-lines/AddJobLineDialog';
import { toast } from 'sonner';
import { WorkOrderJobLine } from '@/types/jobLine';
import { 
  loadJobLinesFromDatabase, 
  saveJobLinesToDatabase,
  deleteJobLineFromDatabase 
} from '@/services/jobLineDatabase';
import { parseJobLinesFromDescription } from '@/services/jobLineParserEnhanced';

interface JobLinesSectionProps {
  workOrderId: string;
  description: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  shopId?: string;
  isEditMode?: boolean;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  shopId,
  isEditMode = false
}: JobLinesSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load job lines when component mounts
  useEffect(() => {
    if (workOrderId && jobLines.length === 0) {
      loadJobLines();
    }
  }, [workOrderId]);

  const loadJobLines = async () => {
    if (!workOrderId) return;
    
    setIsLoading(true);
    try {
      const lines = await loadJobLinesFromDatabase(workOrderId);
      // Ensure all job lines have the enhanced fields with defaults
      const enhancedLines = lines.map(line => ({
        ...line,
        parts: (line.parts || []).map(part => ({
          ...part,
          // Ensure all enhanced fields are present with defaults
          category: part.category || 'Other',
          isTaxable: part.isTaxable ?? true,
          coreChargeAmount: part.coreChargeAmount || 0,
          coreChargeApplied: part.coreChargeApplied ?? false,
          warrantyDuration: part.warrantyDuration || 'No Warranty',
          warrantyExpiryDate: part.warrantyExpiryDate || null,
          installDate: part.installDate || null,
          installedBy: part.installedBy || null,
          status: part.status || 'ordered',
          isStockItem: part.isStockItem ?? false,
          dateAdded: part.dateAdded || new Date().toISOString(),
          attachments: part.attachments || [],
          notesInternal: part.notesInternal || null
        }))
      }));
      onJobLinesChange(enhancedLines);
    } catch (error) {
      console.error('Error loading job lines:', error);
      toast.error('Failed to load job lines');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshJobLines = async () => {
    if (!description?.trim()) {
      toast.error('Work order description is required to parse job lines');
      return;
    }

    setIsRefreshing(true);
    try {
      // Parse job lines from description
      const parsedJobLines = parseJobLinesFromDescription(description);
      
      if (parsedJobLines.length === 0) {
        toast.info('No job lines could be parsed from the description');
        return;
      }

      // Assign work order ID to parsed job lines
      const jobLinesWithWorkOrderId = parsedJobLines.map(line => ({
        ...line,
        workOrderId,
        id: crypto.randomUUID()
      }));

      // Save to database
      await saveJobLinesToDatabase(workOrderId, [...jobLines, ...jobLinesWithWorkOrderId]);

      // Update state with enhanced fields
      const enhancedJobLines = jobLinesWithWorkOrderId.map(line => ({
        ...line,
        parts: (line.parts || []).map(part => ({
          ...part,
          category: part.category || 'Other',
          isTaxable: part.isTaxable ?? true,
          coreChargeAmount: part.coreChargeAmount || 0,
          coreChargeApplied: part.coreChargeApplied ?? false,
          warrantyDuration: part.warrantyDuration || 'No Warranty',
          warrantyExpiryDate: part.warrantyExpiryDate || null,
          installDate: part.installDate || null,
          installedBy: part.installedBy || null,
          status: part.status || 'ordered',
          isStockItem: part.isStockItem ?? false,
          dateAdded: part.dateAdded || new Date().toISOString(),
          attachments: part.attachments || [],
          notesInternal: part.notesInternal || null
        }))
      }));

      const combinedJobLines = [...jobLines, ...enhancedJobLines];
      onJobLinesChange(combinedJobLines);
      toast.success(`Successfully parsed and added ${enhancedJobLines.length} job line${enhancedJobLines.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error refreshing job lines:', error);
      toast.error('Failed to parse job lines from description');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleJobLineAdd = async (newJobLines: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      // Convert to full job lines with IDs and timestamps
      const jobLinesWithIds = newJobLines.map(line => ({
        ...line,
        id: crypto.randomUUID(),
        workOrderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        parts: (line.parts || []).map(part => ({
          ...part,
          category: part.category || 'Other',
          isTaxable: part.isTaxable ?? true,
          coreChargeAmount: part.coreChargeAmount || 0,
          coreChargeApplied: part.coreChargeApplied ?? false,
          warrantyDuration: part.warrantyDuration || 'No Warranty',
          warrantyExpiryDate: part.warrantyExpiryDate || null,
          installDate: part.installDate || null,
          installedBy: part.installedBy || null,
          status: part.status || 'ordered',
          isStockItem: part.isStockItem ?? false,
          dateAdded: part.dateAdded || new Date().toISOString(),
          attachments: part.attachments || [],
          notesInternal: part.notesInternal || null
        }))
      }));

      // Save to database
      const updatedJobLines = [...jobLines, ...jobLinesWithIds];
      await saveJobLinesToDatabase(workOrderId, updatedJobLines);
      
      onJobLinesChange(updatedJobLines);
      setShowAddDialog(false);
      toast.success(`${jobLinesWithIds.length} job line${jobLinesWithIds.length > 1 ? 's' : ''} added successfully`);
    } catch (error) {
      console.error('Error adding job lines:', error);
      toast.error('Failed to add job lines');
    }
  };

  const handleJobLineUpdate = async (updatedJobLine: WorkOrderJobLine) => {
    try {
      const updatedJobLines = jobLines.map(line => 
        line.id === updatedJobLine.id ? updatedJobLine : line
      );
      
      await saveJobLinesToDatabase(workOrderId, updatedJobLines);
      onJobLinesChange(updatedJobLines);
      toast.success('Job line updated successfully');
    } catch (error) {
      console.error('Error updating job line:', error);
      toast.error('Failed to update job line');
    }
  };

  const handleJobLineDelete = async (jobLineId: string) => {
    try {
      await deleteJobLineFromDatabase(jobLineId);
      const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
      onJobLinesChange(updatedJobLines);
      toast.success('Job line deleted successfully');
    } catch (error) {
      console.error('Error deleting job line:', error);
      toast.error('Failed to delete job line');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Job Lines & Services</h3>
          <p className="text-sm text-muted-foreground">
            Services and labor items for this work order
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {description && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshJobLines}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Parse from Description
            </Button>
          )}
          
          {isEditMode && (
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Job Line
            </Button>
          )}
        </div>
      </div>

      <JobLinesGrid
        jobLines={jobLines}
        onUpdate={handleJobLineUpdate}
        onDelete={handleJobLineDelete}
        isEditMode={isEditMode}
      />

      {showAddDialog && (
        <AddJobLineDialog
          workOrderId={workOrderId}
          onJobLineAdd={handleJobLineAdd}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      )}
    </div>
  );
}
