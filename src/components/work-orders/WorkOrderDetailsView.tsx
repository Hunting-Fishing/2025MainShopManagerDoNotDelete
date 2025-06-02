
import React, { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPageLayout } from './WorkOrderPageLayout';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderInvoiceView } from './details/WorkOrderInvoiceView';
import { WorkOrderViewToggle } from './details/WorkOrderViewToggle';
import { loadJobLinesFromDatabase, saveJobLinesToDatabase } from '@/services/jobLineParserEnhanced';
import { toast } from 'sonner';

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [jobLinesLoading, setJobLinesLoading] = useState(true);
  const [view, setView] = useState<'detailed' | 'invoice'>('detailed');

  // Load job lines from database
  useEffect(() => {
    const loadJobLines = async () => {
      try {
        setJobLinesLoading(true);
        const lines = await loadJobLinesFromDatabase(workOrder.id);
        setJobLines(lines);
      } catch (error) {
        console.error('Error loading job lines:', error);
        toast.error('Failed to load job lines');
      } finally {
        setJobLinesLoading(false);
      }
    };

    if (workOrder.id) {
      loadJobLines();
    }
  }, [workOrder.id]);

  const handleJobLinesChange = async (updatedJobLines: WorkOrderJobLine[]) => {
    try {
      setJobLines(updatedJobLines);
      await saveJobLinesToDatabase(workOrder.id, updatedJobLines);
      toast.success('Job lines saved successfully');
    } catch (error) {
      console.error('Error saving job lines:', error);
      toast.error('Failed to save job lines');
    }
  };

  // Get work order title with better error handling
  const getWorkOrderTitle = () => {
    try {
      const shortId = workOrder.id?.slice(0, 8) || 'Unknown';
      return `Work Order #${shortId}`;
    } catch (error) {
      console.error('Error getting work order title:', error);
      return 'Work Order Details';
    }
  };

  // Get work order description with fallback
  const getWorkOrderDescription = () => {
    try {
      return workOrder.description || 'No description available';
    } catch (error) {
      console.error('Error getting work order description:', error);
      return 'Description unavailable';
    }
  };

  console.log('WorkOrderDetailsView rendering with workOrder:', workOrder);

  return (
    <WorkOrderPageLayout
      title={getWorkOrderTitle()}
      description={getWorkOrderDescription()}
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
      actions={
        <WorkOrderViewToggle 
          view={view} 
          onViewChange={setView}
        />
      }
    >
      {view === 'invoice' ? (
        <WorkOrderInvoiceView 
          workOrder={workOrder} 
          jobLines={jobLines}
        />
      ) : (
        <div className="space-y-6">
          <WorkOrderDetailsHeader workOrder={workOrder} />
          
          <WorkOrderDetailsTabs 
            workOrder={workOrder}
            timeEntries={workOrder.timeEntries || []}
            onUpdateTimeEntries={() => {}}
            inventoryItems={workOrder.inventoryItems || []}
            notes={workOrder.notes || ''}
            onUpdateNotes={() => {}}
            jobLines={jobLines}
            onJobLinesChange={handleJobLinesChange}
            jobLinesLoading={jobLinesLoading}
          />
        </div>
      )}
    </WorkOrderPageLayout>
  );
}
