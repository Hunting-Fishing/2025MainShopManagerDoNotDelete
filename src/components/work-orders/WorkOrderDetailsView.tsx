
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useJobLines } from '@/hooks/useJobLines';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { WorkOrderEditForm } from './WorkOrderEditForm';
import { WorkOrderPageLayout } from './WorkOrderPageLayout';
import { WorkOrderOverviewHeader } from './details/WorkOrderOverviewHeader';
import { Button } from '@/components/ui/button';
import { Edit, Eye, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { WorkOrderPart } from '@/types/workOrderPart';

export function WorkOrderDetailsView() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isEditRoute = location.pathname.includes('/edit');
  const shouldAutoEdit = () => location.state?.autoEdit === true;
  
  const [isEditMode, setIsEditMode] = useState(isEditRoute || shouldAutoEdit());
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [workOrderParts, setWorkOrderParts] = useState<WorkOrderPart[]>([]);

  const { workOrder, isLoading, error } = useWorkOrder(id!);
  const { jobLines, isLoading: jobLinesLoading } = useJobLines(id!);

  useEffect(() => {
    if (workOrder) {
      setNotes(workOrder.notes || '');
    }
  }, [workOrder]);

  useEffect(() => {
    if (id) {
      // Fetch standalone work order parts (not attached to job lines)
      getWorkOrderParts(id).then(parts => {
        console.log('Standalone work order parts:', parts);
        setWorkOrderParts(parts);
      }).catch(error => {
        console.error('Error fetching work order parts:', error);
      });
    }
  }, [id]);

  useEffect(() => {
    if (isEditRoute) {
      setIsEditMode(true);
    }
  }, [isEditRoute]);

  const handleToggleEditMode = () => {
    if (isEditMode) {
      navigate(`/work-orders/${id}`);
    } else {
      navigate(`/work-orders/${id}/edit`);
    }
  };

  const handleUpdateNotes = (updatedNotes: string) => {
    setNotes(updatedNotes);
  };

  const handleUpdateTimeEntries = (updatedEntries: any[]) => {
    setTimeEntries(updatedEntries);
  };

  const handleJobLinesChange = (updatedJobLines: any[]) => {
    // Handle job lines changes if needed
    console.log('Job lines updated:', updatedJobLines);
  };

  const handleCancel = () => {
    if (isEditRoute) {
      navigate(`/work-orders/${id}`);
    } else {
      navigate('/work-orders');
    }
  };

  const handleSave = () => {
    // Handle save logic
    console.log('Saving work order changes...');
    navigate(`/work-orders/${id}`);
  };

  if (isLoading || jobLinesLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Order Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load work order details.</p>
          <Button asChild>
            <Link to="/work-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Work Orders
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Extract all parts from job lines
  const allPartsFromJobLines = jobLines.reduce((acc: WorkOrderPart[], jobLine) => {
    if (jobLine.parts && jobLine.parts.length > 0) {
      return [...acc, ...jobLine.parts];
    }
    return acc;
  }, []);

  // Combine standalone parts with parts from job lines
  const allParts = [...workOrderParts, ...allPartsFromJobLines];

  console.log('WorkOrderDetailsView - jobLines with parts:', jobLines);
  console.log('WorkOrderDetailsView - allParts:', allParts);
  console.log('WorkOrderDetailsView - workOrder data:', workOrder);

  if (isEditMode) {
    return (
      <WorkOrderEditForm
        workOrderId={id!}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    );
  }

  return (
    <WorkOrderPageLayout 
      title={`Work Order #${workOrder.work_order_number || workOrder.id?.slice(-8)}`}
      actions={
        <Button onClick={handleToggleEditMode} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Work Order
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Work Order Overview Header */}
        <WorkOrderOverviewHeader 
          workOrder={workOrder}
          jobLines={jobLines || []}
          allParts={allParts}
        />

        {/* Work Order Details Tabs */}
        <WorkOrderDetailsTabs 
          workOrder={workOrder}
          timeEntries={timeEntries}
          onUpdateTimeEntries={handleUpdateTimeEntries}
          inventoryItems={workOrder.inventoryItems || []}
          notes={notes}
          onUpdateNotes={handleUpdateNotes}
          jobLines={jobLines || []}
          parts={workOrderParts}
          onJobLinesChange={handleJobLinesChange}
          jobLinesLoading={jobLinesLoading}
          isEditMode={false}
        />
      </div>
    </WorkOrderPageLayout>
  );
}
