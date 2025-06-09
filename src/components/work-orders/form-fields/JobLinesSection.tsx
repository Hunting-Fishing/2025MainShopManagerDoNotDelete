
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { AddJobLineDialog } from '../job-lines/AddJobLineDialog';
import { toast } from 'sonner';
import { 
  getWorkOrderJobLines, 
  createWorkOrderJobLine, 
  updateWorkOrderJobLine, 
  deleteWorkOrderJobLine 
} from '@/services/workOrder/jobLineService';
import { jobLineParserEnhanced } from '@/services/workOrder/jobLineParserEnhanced';

interface JobLinesSectionProps {
  workOrderId: string;
  description: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  shopId: string;
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
      const lines = await getWorkOrderJobLines(workOrderId);
      
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
      const parsedJobLines = await jobLineParserEnhanced.parseJobLines(description, shopId);
      
      if (parsedJobLines.length === 0) {
        toast.info('No job lines could be parsed from the description');
        return;
      }

      // Save parsed job lines to database
      const savedJobLines: WorkOrderJobLine[] = [];
      for (const jobLine of parsedJobLines) {
        try {
          const saved = await createWorkOrderJobLine(workOrderId, jobLine);
          if (saved) {
            // Ensure the saved job line has enhanced fields with defaults
            const enhancedSaved = {
              ...saved,
              parts: (saved.parts || []).map(part => ({
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
            };
            savedJobLines.push(enhancedSaved);
          }
        } catch (error) {
          console.error('Error saving job line:', error);
        }
      }

      if (savedJobLines.length > 0) {
        // Combine with existing job lines, ensuring enhanced fields
        const combinedJobLines = [...jobLines, ...savedJobLines].map(line => ({
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
        
        onJobLinesChange(combinedJobLines);
        toast.success(`Successfully parsed and added ${savedJobLines.length} job line${savedJobLines.length > 1 ? 's' : ''}`);
      } else {
        toast.error('Failed to save parsed job lines');
      }
    } catch (error) {
      console.error('Error refreshing job lines:', error);
      toast.error('Failed to parse job lines from description');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleJobLineAdd = async (newJobLine: WorkOrderJobLine) => {
    try {
      const savedJobLine = await createWorkOrderJobLine(workOrderId, newJobLine);
      if (savedJobLine) {
        // Ensure the saved job line has enhanced fields with defaults
        const enhancedSaved = {
          ...savedJobLine,
          parts: (savedJobLine.parts || []).map(part => ({
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
        };
        
        const updatedJobLines = [...jobLines, enhancedSaved];
        onJobLinesChange(updatedJobLines);
        setShowAddDialog(false);
        toast.success('Job line added successfully');
      }
    } catch (error) {
      console.error('Error adding job line:', error);
      toast.error('Failed to add job line');
    }
  };

  const handleJobLineUpdate = async (updatedJobLine: WorkOrderJobLine) => {
    try {
      const savedJobLine = await updateWorkOrderJobLine(updatedJobLine.id, updatedJobLine);
      if (savedJobLine) {
        const updatedJobLines = jobLines.map(line => 
          line.id === updatedJobLine.id ? savedJobLine : line
        );
        onJobLinesChange(updatedJobLines);
        toast.success('Job line updated successfully');
      }
    } catch (error) {
      console.error('Error updating job line:', error);
      toast.error('Failed to update job line');
    }
  };

  const handleJobLineDelete = async (jobLineId: string) => {
    try {
      await deleteWorkOrderJobLine(jobLineId);
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
              variant="outline"
              size="sm"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
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
        isLoading={isLoading}
      />

      <AddJobLineDialog
        workOrderId={workOrderId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onJobLineAdd={handleJobLineAdd}
      />
    </div>
  );
}
