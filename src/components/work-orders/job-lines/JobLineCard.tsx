
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Plus, Package, Wrench } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';
import { PartDetailsCard } from '../parts/PartDetailsCard';
import { AddPartsDialog } from '../parts/AddPartsDialog';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsChange?: (parts: WorkOrderPart[]) => void;
  isEditMode?: boolean;
  parts?: WorkOrderPart[];
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartRemove?: (partId: string) => void;
}

export function JobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  onPartsChange,
  isEditMode = false,
  parts = [],
  onPartUpdate,
  onPartRemove
}: JobLineCardProps) {
  const [showAddPartsDialog, setShowAddPartsDialog] = useState(false);
  const statusInfo = jobLineStatusMap[jobLine.status || 'pending'];

  // Get parts associated with this job line
  const jobLineParts = parts.filter(part => part.job_line_id === jobLine.id);

  // Calculate parts total for this job line
  const partsTotal = jobLineParts.reduce((total, part) => {
    const quantity = Number(part.quantity) || 1;
    const unitPrice = Number(part.unit_price || part.customerPrice) || 0;
    return total + (quantity * unitPrice);
  }, 0);

  // Calculate job line total (labor + parts)
  const laborTotal = Number(jobLine.total_amount) || 0;
  const jobLineTotal = laborTotal + partsTotal;

  const handlePartAdd = (newPart: WorkOrderPart) => {
    if (onPartsChange) {
      const updatedParts = [...parts, newPart];
      onPartsChange(updatedParts);
    }
    setShowAddPartsDialog(false);
  };

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    if (onPartsChange) {
      const updatedParts = parts.map(p => p.id === updatedPart.id ? updatedPart : p);
      onPartsChange(updatedParts);
    }
    if (onPartUpdate) {
      onPartUpdate(updatedPart);
    }
  };

  const handlePartRemove = (partId: string) => {
    if (onPartsChange) {
      const updatedParts = parts.filter(p => p.id !== partId);
      onPartsChange(updatedParts);
    }
    if (onPartRemove) {
      onPartRemove(partId);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-emerald-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-lg">{jobLine.name}</CardTitle>
                <Badge className={`${statusInfo.classes} font-medium`}>
                  {statusInfo.label}
                </Badge>
              </div>
              
              {jobLine.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {jobLine.description}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  {jobLine.estimated_hours && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Hours:</span>
                      <span className="font-medium">{jobLine.estimated_hours}</span>
                    </div>
                  )}
                  {jobLine.labor_rate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Labor Rate:</span>
                      <span className="font-medium">${jobLine.labor_rate}/hr</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labor Total:</span>
                    <span className="font-medium">${laborTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parts Total:</span>
                    <span className="font-medium">${partsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-semibold">Job Line Total:</span>
                    <span className="font-bold text-emerald-600">${jobLineTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {isEditMode && (
              <div className="flex gap-2 ml-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddPartsDialog(true)}
                  className="hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete?.(jobLine.id)}
                  className="hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {jobLineParts.length > 0 && (
          <CardContent className="pt-0">
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium text-sm">Associated Parts ({jobLineParts.length})</h4>
              </div>
              <div className="space-y-3">
                {jobLineParts.map((part) => (
                  <PartDetailsCard
                    key={part.id}
                    part={part}
                    onUpdate={handlePartUpdate}
                    onRemove={handlePartRemove}
                    isEditMode={isEditMode}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        )}
        
        {jobLine.notes && (
          <CardContent className="pt-0">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-medium">Notes:</span> {jobLine.notes}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {showAddPartsDialog && (
        <AddPartsDialog
          open={showAddPartsDialog}
          onOpenChange={setShowAddPartsDialog}
          workOrderId={jobLine.work_order_id}
          jobLineId={jobLine.id}
          onPartAdd={handlePartAdd}
        />
      )}
    </>
  );
}
