
import React, { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Phone, Mail } from 'lucide-react';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

interface WorkOrderCommunicationsProps {
  workOrder: WorkOrder;
  isEditMode?: boolean;
}

export function WorkOrderCommunications({ 
  workOrder, 
  isEditMode = false 
}: WorkOrderCommunicationsProps) {
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!workOrder.id) return;
      
      try {
        setIsLoading(true);
        const [lines, parts] = await Promise.all([
          getWorkOrderJobLines(workOrder.id),
          getWorkOrderParts(workOrder.id)
        ]);
        setJobLines(lines);
        setAllParts(parts);
      } catch (error) {
        console.error('Error fetching job lines and parts:', error);
        setJobLines([]);
        setAllParts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workOrder.id]);

  const handleJobLineUpdate = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(line => 
      line.id === updatedJobLine.id ? updatedJobLine : line
    );
    setJobLines(updatedJobLines);
  };

  const handleJobLineDelete = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
    setJobLines(updatedJobLines);
  };

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    const updatedParts = allParts.map(part => 
      part.id === updatedPart.id ? updatedPart : part
    );
    setAllParts(updatedParts);
  };

  const handlePartDelete = (partId: string) => {
    const updatedParts = allParts.filter(part => part.id !== partId);
    setAllParts(updatedParts);
  };

  return (
    <div className="space-y-6">
      {/* Communications Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communications Log
            </CardTitle>
            {isEditMode && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 px-3">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Customer
                </Button>
                <Button size="sm" variant="outline" className="h-8 px-3">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button size="sm" className="h-8 px-3">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No communications logged yet</p>
            {isEditMode && (
              <p className="text-xs mt-2">Record calls, emails, and notes related to this work order</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      {workOrder.customer_name && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span className="font-medium">{workOrder.customer_name}</span>
              </div>
              {workOrder.customer_email && (
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-medium">{workOrder.customer_email}</span>
                </div>
              )}
              {workOrder.customer_phone && (
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium">{workOrder.customer_phone}</span>
                </div>
              )}
              {workOrder.customer_address && (
                <div>
                  <span className="text-muted-foreground">Address: </span>
                  <span className="font-medium">{workOrder.customer_address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Lines & Parts Context */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Work Details Reference</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Loading job lines and parts...
            </div>
          ) : (
            <CompactJobLinesTable
              jobLines={jobLines}
              allParts={allParts}
              onUpdate={isEditMode ? handleJobLineUpdate : undefined}
              onDelete={isEditMode ? handleJobLineDelete : undefined}
              onPartUpdate={isEditMode ? handlePartUpdate : undefined}
              onPartDelete={isEditMode ? handlePartDelete : undefined}
              isEditMode={isEditMode}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
