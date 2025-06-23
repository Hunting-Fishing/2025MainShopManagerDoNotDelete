import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Trash2, Edit, Package } from 'lucide-react';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { PartsFormValidator } from '@/utils/partsErrorHandler';
import { toast } from 'sonner';

interface PartsTableProps {
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  workOrderId: string;
  onPartsChange: () => void;
  isEditMode?: boolean;
}

export function PartsTable({ 
  parts, 
  jobLines, 
  workOrderId, 
  onPartsChange, 
  isEditMode = false 
}: PartsTableProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickAdd = async (jobLineId: string) => {
    setIsLoading(true);
    try {
      const quickPartData = {
        name: 'New Part',
        part_number: `PART-${Date.now()}`,
        quantity: 1,
        unit_price: 0,
        status: 'pending',
        job_line_id: jobLineId,
        part_type: 'inventory' // Add required part_type field
      };

      await createWorkOrderPart(workOrderId, quickPartData);
      PartsFormValidator.showSuccessToast('Part added successfully');
      onPartsChange();
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      PartsFormValidator.showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {jobLines.map((jobLine) => {
        const jobLineParts = parts.filter(part => part.job_line_id === jobLine.id);
        
        return (
          <div key={jobLine.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold">{jobLine.name}</h3>
                <p className="text-sm text-muted-foreground">{jobLine.description}</p>
              </div>
              {isEditMode && (
                <Button
                  size="sm"
                  onClick={() => handleQuickAdd(jobLine.id)}
                  disabled={isLoading}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              )}
            </div>
            
            {jobLineParts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    {isEditMode && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobLineParts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell>{part.part_number}</TableCell>
                      <TableCell>{part.quantity}</TableCell>
                      <TableCell>${(part.unit_price || 0).toFixed(2)}</TableCell>
                      <TableCell>${part.total_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{part.status}</Badge>
                      </TableCell>
                      {isEditMode && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No parts assigned to this job line</p>
                {isEditMode && (
                  <Button 
                    className="mt-2" 
                    variant="outline" 
                    onClick={() => handleQuickAdd(jobLine.id)}
                    disabled={isLoading}
                  >
                    Add First Part
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
