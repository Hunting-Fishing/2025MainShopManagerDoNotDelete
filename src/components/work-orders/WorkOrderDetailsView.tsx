
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPageLayout } from './WorkOrderPageLayout';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderInvoiceView } from './details/WorkOrderInvoiceView';
import { WorkOrderViewToggle } from './details/WorkOrderViewToggle';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import { saveJobLinesToDatabase } from '@/services/jobLineService';
import { toast } from 'sonner';

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const navigate = useNavigate();
  // Use job lines from the enriched work order data
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>(workOrder.jobLines || []);
  const [view, setView] = useState<'detailed' | 'invoice'>('detailed');
  const [isEditMode, setIsEditMode] = useState(false);

  // Update job lines when work order changes
  useEffect(() => {
    if (workOrder.jobLines) {
      console.log('Setting job lines from work order data:', workOrder.jobLines.length);
      setJobLines(workOrder.jobLines);
    }
  }, [workOrder.jobLines]);

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

  const handleEditToggle = () => {
    if (isEditMode) {
      setIsEditMode(false);
      toast.success('Changes saved successfully');
    } else {
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset job lines to original state
    if (workOrder.jobLines) {
      setJobLines(workOrder.jobLines);
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

  const editModeActions = isEditMode ? (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancelEdit}
        className="flex items-center gap-1"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={handleEditToggle}
        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
      >
        <Save className="h-4 w-4" />
        Save Changes
      </Button>
    </div>
  ) : (
    <Button
      size="sm"
      onClick={handleEditToggle}
      className="flex items-center gap-1"
    >
      <Edit className="h-4 w-4" />
      Edit Work Order
    </Button>
  );

  const actions = (
    <div className="flex items-center gap-2">
      {view === 'detailed' && editModeActions}
      <WorkOrderViewToggle 
        view={view} 
        onViewChange={setView}
      />
    </div>
  );

  console.log('WorkOrderDetailsView rendering with job lines:', jobLines.length);

  return (
    <WorkOrderPageLayout
      title={getWorkOrderTitle()}
      description={getWorkOrderDescription()}
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
      actions={actions}
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
            jobLinesLoading={false} // No longer loading separately
            isEditMode={isEditMode}
          />
        </div>
      )}
    </WorkOrderPageLayout>
  );
}
