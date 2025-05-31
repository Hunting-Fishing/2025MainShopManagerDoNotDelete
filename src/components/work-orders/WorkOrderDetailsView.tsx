
import React, { useState, useEffect } from "react";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { parseJobLinesFromDescriptionEnhanced, saveJobLinesToDatabase, loadJobLinesFromDatabase } from "@/services/jobLineParserEnhanced";
import { WorkOrderPageLayout } from "./WorkOrderPageLayout";
import { WorkOrderDetailsHeader } from "./details/WorkOrderDetailsHeader";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";
import { WorkOrderInvoiceView } from "./WorkOrderInvoiceView";
import { EditableJobLinesGrid } from "./job-lines/EditableJobLinesGrid";
import { JobLinesDebugInfo } from "./job-lines/JobLinesDebugInfo";
import { Button } from "@/components/ui/button";
import { FileText, Layout, Save } from "lucide-react";
import { toast } from "sonner";

export interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder?.timeEntries || []);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [notes, setNotes] = useState<string>(workOrder?.notes || '');
  const [viewMode, setViewMode] = useState<'details' | 'invoice'>('details');
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [isLoadingJobLines, setIsLoadingJobLines] = useState(true);
  const [isSavingJobLines, setIsSavingJobLines] = useState(false);

  // Load job lines from database or parse from description
  useEffect(() => {
    async function loadJobLines() {
      if (!workOrder?.id) return;
      
      setIsLoadingJobLines(true);
      
      try {
        // First try to load from database
        const savedJobLines = await loadJobLinesFromDatabase(workOrder.id);
        
        if (savedJobLines.length > 0) {
          console.log('Loaded job lines from database:', savedJobLines);
          setJobLines(savedJobLines);
        } else if (workOrder.description) {
          // If no saved job lines, parse from description using enhanced parser
          console.log('No saved job lines found, parsing from description');
          const parsedJobLines = await parseJobLinesFromDescriptionEnhanced(
            workOrder.description, 
            workOrder.id,
            workOrder.customer_id // Use as shop ID if available
          );
          setJobLines(parsedJobLines);
          
          // Auto-save the parsed job lines
          if (parsedJobLines.length > 0) {
            await saveJobLinesToDatabase(workOrder.id, parsedJobLines);
            toast.success('Job lines parsed and saved from work order description');
          }
        }
      } catch (error) {
        console.error('Error loading job lines:', error);
        toast.error('Failed to load job lines');
      } finally {
        setIsLoadingJobLines(false);
      }
    }

    loadJobLines();
  }, [workOrder?.id, workOrder?.description, workOrder?.customer_id]);

  // Create enhanced work order with job lines
  const enhancedWorkOrder = {
    ...workOrder,
    jobLines: jobLines
  };

  if (!workOrder) {
    return null;
  }
  
  // Handler for updating time entries
  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setTimeEntries(entries);
  };
  
  // Handler for updating notes
  const handleUpdateNotes = (updatedNotes: string) => {
    setNotes(updatedNotes);
  };

  // Handler for updating job lines
  const handleUpdateJobLine = async (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(line => 
      line.id === updatedJobLine.id ? updatedJobLine : line
    );
    setJobLines(updatedJobLines);
    
    // Save to database
    try {
      await saveJobLinesToDatabase(workOrder.id, updatedJobLines);
      toast.success('Job line updated successfully');
    } catch (error) {
      console.error('Error saving updated job line:', error);
      toast.error('Failed to save job line changes');
    }
  };

  // Handler for deleting job lines
  const handleDeleteJobLine = async (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
    setJobLines(updatedJobLines);
    
    // Save to database
    try {
      await saveJobLinesToDatabase(workOrder.id, updatedJobLines);
      toast.success('Job line deleted successfully');
    } catch (error) {
      console.error('Error saving after job line deletion:', error);
      toast.error('Failed to delete job line');
    }
  };

  // Handler for adding new job lines
  const handleAddJobLine = async (newJobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJobLine: WorkOrderJobLine = {
      ...newJobLineData,
      id: `${workOrder.id}-job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedJobLines = [...jobLines, newJobLine];
    setJobLines(updatedJobLines);
    
    // Save to database
    try {
      await saveJobLinesToDatabase(workOrder.id, updatedJobLines);
      toast.success('Job line added successfully');
    } catch (error) {
      console.error('Error saving new job line:', error);
      toast.error('Failed to add job line');
    }
  };

  // Handler for manually saving job lines
  const handleSaveJobLines = async () => {
    if (jobLines.length === 0) {
      toast.error('No job lines to save');
      return;
    }

    setIsSavingJobLines(true);
    try {
      await saveJobLinesToDatabase(workOrder.id, jobLines);
      toast.success('All job lines saved successfully');
    } catch (error) {
      console.error('Error saving job lines:', error);
      toast.error('Failed to save job lines');
    } finally {
      setIsSavingJobLines(false);
    }
  };

  return (
    <WorkOrderPageLayout
      title={`Work Order: ${workOrder.id}`}
      description={workOrder.description || "No description provided"}
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
    >
      <div className="space-y-6">
        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Work Order Details</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'details' ? 'default' : 'outline'}
              onClick={() => setViewMode('details')}
              className="flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              Details View
            </Button>
            <Button
              variant={viewMode === 'invoice' ? 'default' : 'outline'}
              onClick={() => setViewMode('invoice')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Invoice View
            </Button>
            {viewMode === 'details' && jobLines.length > 0 && (
              <Button
                onClick={handleSaveJobLines}
                disabled={isSavingJobLines}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Save className="h-4 w-4" />
                {isSavingJobLines ? 'Saving...' : 'Save Job Lines'}
              </Button>
            )}
          </div>
        </div>

        {viewMode === 'details' ? (
          <>
            <WorkOrderDetailsHeader workOrder={enhancedWorkOrder} />
            
            {/* Enhanced Job Lines Section */}
            {isLoadingJobLines ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading job lines...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <EditableJobLinesGrid 
                  jobLines={jobLines}
                  onUpdateJobLine={handleUpdateJobLine}
                  onDeleteJobLine={handleDeleteJobLine}
                  onAddJobLine={handleAddJobLine}
                  workOrderId={workOrder.id}
                  shopId={workOrder.customer_id} // Use customer_id as shop context
                  showSummary={true}
                />
              </div>
            )}

            {/* Debug Info - Only shown in development or when there are issues */}
            <JobLinesDebugInfo 
              jobLines={jobLines} 
              description={workOrder.description} 
            />
            
            <WorkOrderDetailsTabs 
              workOrder={enhancedWorkOrder}
              timeEntries={timeEntries}
              inventoryItems={inventoryItems}
              notes={notes}
              onUpdateNotes={handleUpdateNotes}
              onUpdateTimeEntries={handleUpdateTimeEntries}
            />
          </>
        ) : (
          <WorkOrderInvoiceView workOrder={enhancedWorkOrder} />
        )}
      </div>
    </WorkOrderPageLayout>
  );
}
