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
import { loadJobLinesFromDatabase, saveJobLinesToDatabase } from '@/services/jobLineDatabase';
import { toast } from 'sonner';

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const navigate = useNavigate();
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [jobLinesLoading, setJobLinesLoading] = useState(true);
  const [view, setView] = useState<'detailed' | 'invoice'>('detailed');
  const [isEditMode, setIsEditMode] = useState(false);

  // Load job lines from database
  const loadJobLines = async () => {
    try {
      setJobLinesLoading(true);
      const lines = await loadJobLinesFromDatabase(workOrder.id);
      console.log('Loaded job lines with parts:', lines);
      setJobLines(lines);
    } catch (error) {
      console.error('Error loading job lines:', error);
      toast.error('Failed to load job lines');
    } finally {
      setJobLinesLoading(false);
    }
  };

  useEffect(() => {
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

  // Function to refresh job lines - this will be called when parts are added
  const handlePartsUpdated = () => {
    console.log('Parts updated, refreshing job lines...');
    loadJobLines();
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // If we're saving/exiting edit mode, you might want to save changes here
      setIsEditMode(false);
      toast.success('Changes saved successfully');
    } else {
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Optionally reload data to discard changes
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

  console.log('WorkOrderDetailsView rendering with workOrder:', workOrder);

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
            jobLinesLoading={jobLinesLoading}
            isEditMode={isEditMode}
            onPartsUpdated={handlePartsUpdated}
          />
        </div>
      )}
    </WorkOrderPageLayout>
  );
}
