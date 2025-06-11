import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useJobLines } from '@/hooks/useJobLines';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobLinesGrid } from './job-lines/JobLinesGrid';
import { WorkOrderDocuments } from './details/WorkOrderDocuments';
import { WorkOrderPartsSection } from './parts/WorkOrderPartsSection';
import { WorkOrderDetailsTab } from './details/WorkOrderDetailsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrderDetailsActions } from './details/WorkOrderDetailsActions';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

export function WorkOrderDetailsView({ workOrderId }: WorkOrderDetailsViewProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const workOrderId = workOrderId || id || '';
  const [isEditMode, setIsEditMode] = useState(false);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  
  const { workOrder, isLoading: workOrderLoading, error: workOrderError } = useWorkOrder(workOrderId);
  const { jobLines, setJobLines, isLoading: jobLinesLoading, error: jobLinesError } = useJobLines(workOrderId);

  // Fetch all work order parts
  useEffect(() => {
    if (!workOrderId) return;
    
    const fetchAllParts = async () => {
      try {
        setPartsLoading(true);
        const parts = await getWorkOrderParts(workOrderId);
        setAllParts(parts);
      } catch (error) {
        console.error('Error fetching work order parts:', error);
      } finally {
        setPartsLoading(false);
      }
    };

    fetchAllParts();
  }, [workOrderId]);

  // Handle invoice creation success
  const handleInvoiceCreated = (invoiceId: string) => {
    console.log('Invoice created:', invoiceId);
    toast({
      title: "Invoice Created",
      description: "Work order was successfully converted to an invoice",
    });
    // Optionally navigate to the invoice
    navigate(`/invoices/${invoiceId}`);
  };

  if (workOrderLoading || jobLinesLoading || partsLoading) {
    return <div>Loading...</div>;
  }

  if (workOrderError || jobLinesError) {
    return <div>Error: {workOrderError?.message || jobLinesError?.message}</div>;
  }

  if (!workOrder) {
    return <div>Work order not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Work Order {workOrder?.work_order_number || workOrder?.id}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {workOrder?.description || 'No description provided'}
          </p>
        </div>
        
        {workOrder && (
          <WorkOrderDetailsActions
            workOrder={workOrder}
            onEdit={() => setIsEditMode(true)}
            onInvoiceCreated={handleInvoiceCreated}
          />
        )}
      </div>

      <Tabs defaultValue="work-order">
        <TabsList className="mb-4">
          <TabsTrigger value="work-order">Work Order Details</TabsTrigger>
          <TabsTrigger value="job-lines">Job Lines</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="work-order">
          <WorkOrderDetailsTab 
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            onJobLinesChange={setJobLines}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="job-lines">
          <JobLinesGrid 
            workOrderId={workOrderId}
            jobLines={jobLines}
            onJobLinesChange={setJobLines}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="parts">
          <WorkOrderPartsSection
            workOrderId={workOrderId}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Time tracking feature will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <WorkOrderDocuments workOrderId={workOrderId} />
        </TabsContent>
        
        <TabsContent value="communications">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Communications feature will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
