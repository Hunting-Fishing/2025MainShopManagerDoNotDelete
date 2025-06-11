
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useJobLines } from '@/hooks/useJobLines';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobLinesGrid } from './job-lines/JobLinesGrid';
import { WorkOrderDocuments } from './details/WorkOrderDocuments';
import { WorkOrderPartsSection } from './parts/WorkOrderPartsSection';
import { WorkOrderDetailsTab } from './details/WorkOrderDetailsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

export function WorkOrderDetailsView({ workOrderId: workOrderIdProp }: WorkOrderDetailsViewProps) {
  const { id } = useParams();
  const workOrderId = workOrderIdProp || id || '';
  const [isEditMode, setIsEditMode] = useState(false);
  const { workOrder, isLoading: workOrderLoading, error: workOrderError } = useWorkOrder(workOrderId);
  const { jobLines, setJobLines, isLoading: jobLinesLoading, error: jobLinesError } = useJobLines(workOrderId);

  if (workOrderLoading || jobLinesLoading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Work Order #{workOrder.id}</h1>
          <p className="text-muted-foreground">
            View and manage work order details.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/work-orders/${workOrderId}/invoice`} target="_blank" className="flex items-center">
              <Printer className="mr-2 h-4 w-4" />
              View Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/work-orders/${workOrderId}/view`} className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              View Public
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Exit Edit Mode
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Work Order
              </>
            )}
          </Button>
        </div>
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
