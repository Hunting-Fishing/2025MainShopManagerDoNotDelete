
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { WorkOrderPageLayout } from './WorkOrderPageLayout';
import { JobLinesGrid } from './job-lines/JobLinesGrid';
import { WorkOrderPartsSection } from './parts/WorkOrderPartsSection';
import { WorkOrderInvoiceView } from './WorkOrderInvoiceView';
import { FileText, Edit, Eye } from 'lucide-react';

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'details' | 'invoice'>('details');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadWorkOrderData();
  }, [workOrder.id]);

  const loadWorkOrderData = async () => {
    try {
      setLoading(true);
      const [jobLinesData, partsData] = await Promise.all([
        getWorkOrderJobLines(workOrder.id),
        getWorkOrderParts(workOrder.id)
      ]);
      
      // Attach parts to their respective job lines
      const jobLinesWithParts = jobLinesData.map(jobLine => {
        const jobLineParts = partsData.filter(part => part.jobLineId === jobLine.id);
        return {
          ...jobLine,
          parts: jobLineParts
        };
      });
      
      setJobLines(jobLinesWithParts);
      setParts(partsData);
    } catch (error) {
      console.error('Error loading work order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobLinesChange = (updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  };

  const actions = (
    <div className="flex gap-2">
      <Button
        variant={view === 'details' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setView('details')}
      >
        <Eye className="h-4 w-4 mr-2" />
        Details
      </Button>
      <Button
        variant={view === 'invoice' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setView('invoice')}
      >
        <FileText className="h-4 w-4 mr-2" />
        Invoice View
      </Button>
      <Button
        variant={isEditMode ? 'default' : 'outline'}
        size="sm"
        onClick={() => setIsEditMode(!isEditMode)}
      >
        <Edit className="h-4 w-4 mr-2" />
        {isEditMode ? 'View Mode' : 'Edit Mode'}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <WorkOrderPageLayout
        title="Loading Work Order..."
        backLink="/work-orders"
      >
        <div className="text-center py-8">Loading work order details...</div>
      </WorkOrderPageLayout>
    );
  }

  return (
    <WorkOrderPageLayout
      title={`Work Order #${workOrder.work_order_number || workOrder.id.slice(0, 8)}`}
      description={workOrder.description}
      backLink="/work-orders"
      actions={actions}
    >
      {view === 'invoice' ? (
        <WorkOrderInvoiceView workOrder={workOrder} jobLines={jobLines} />
      ) : (
        <div className="space-y-6">
          {/* Work Order Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Work Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="ml-2">
                    {workOrder.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Customer:</span>
                  <span className="ml-2">{workOrder.customer_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Vehicle:</span>
                  <span className="ml-2">
                    {workOrder.vehicle ? 
                      `${workOrder.vehicle.year} ${workOrder.vehicle.make} ${workOrder.vehicle.model}` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Lines Section */}
          <JobLinesGrid
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={handleJobLinesChange}
            isEditMode={isEditMode}
            showSummary={true}
          />

          {/* Parts Section */}
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            isEditMode={isEditMode}
          />
        </div>
      )}
    </WorkOrderPageLayout>
  );
}
