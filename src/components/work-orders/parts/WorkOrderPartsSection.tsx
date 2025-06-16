
import React, { useState, useEffect } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  isEditMode
}: WorkOrderPartsSectionProps) {
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!workOrderId) return;
      
      try {
        setIsLoading(true);
        const [parts, lines] = await Promise.all([
          getWorkOrderParts(workOrderId),
          getWorkOrderJobLines(workOrderId)
        ]);
        setAllParts(parts);
        setJobLines(lines);
      } catch (error) {
        console.error('Error fetching parts and job lines:', error);
        setAllParts([]);
        setJobLines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workOrderId]);

  const handleEditPart = (part: WorkOrderPart) => {
    console.log('Edit part clicked:', part.id, part.name);
    // TODO: Implement part edit dialog
  };

  const handleDeletePart = (partId: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      const updatedParts = allParts.filter(part => part.id !== partId);
      setAllParts(updatedParts);
    }
  };

  const getJobLineName = (jobLineId?: string) => {
    if (!jobLineId) return 'Unassigned';
    const jobLine = jobLines.find(line => line.id === jobLineId);
    return jobLine?.name || 'Unknown Job Line';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Parts & Inventory</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Loading parts...
          </div>
        ) : allParts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No parts found
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
              <div className="col-span-4">Part</div>
              <div className="col-span-2">Job Line</div>
              <div className="col-span-1">Qty</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Total</div>
              {isEditMode && <div className="col-span-1">Actions</div>}
            </div>

            {allParts.map((part) => (
              <div key={part.id} className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 hover:bg-gray-50">
                <div className="col-span-4">
                  <div className="font-medium text-sm">{part.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Part #: {part.part_number}
                  </div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Part
                  </Badge>
                </div>
                <div className="col-span-2 text-sm">
                  {getJobLineName(part.job_line_id)}
                </div>
                <div className="col-span-1 text-sm">
                  {part.quantity}
                </div>
                <div className="col-span-2 text-sm">
                  ${part.unit_price}
                </div>
                <div className="col-span-2 text-sm font-medium">
                  ${part.total_price}
                </div>
                {isEditMode && (
                  <div className="col-span-1 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditPart(part)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeletePart(part.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
