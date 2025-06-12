
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { PartDetailsCard } from '../parts/PartDetailsCard';
import { AddPartsDialog } from '../parts/AddPartsDialog';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete: (jobLineId: string) => void;
  isEditMode?: boolean;
  parts?: WorkOrderPart[];
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartRemove?: (partId: string) => void;
  onPartsChange?: (parts: WorkOrderPart[]) => void;
}

export function JobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  isEditMode = false,
  parts = [],
  onPartUpdate,
  onPartRemove,
  onPartsChange
}: JobLineCardProps) {
  const [showAddPartsDialog, setShowAddPartsDialog] = useState(false);

  // Filter parts that belong to this job line
  const jobLineParts = parts.filter(part => part.job_line_id === jobLine.id);

  // Calculate totals for this job line
  const laborTotal = (jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0);
  
  // Calculate parts total with proper null checks and use unit_price instead of customer_price
  const partsTotal = jobLineParts.reduce((sum, part) => {
    const price = part.unit_price || part.customerPrice || 0;
    const quantity = part.quantity || 0;
    return sum + (price * quantity);
  }, 0);

  const jobLineTotal = laborTotal + partsTotal;

  const handlePartAdd = (newPart: WorkOrderPart) => {
    if (onPartsChange) {
      const updatedParts = [...parts, newPart];
      onPartsChange(updatedParts);
    }
    setShowAddPartsDialog(false);
  };

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    if (onPartUpdate) {
      onPartUpdate(updatedPart);
    }
  };

  const handlePartRemove = (partId: string) => {
    if (onPartRemove) {
      onPartRemove(partId);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{jobLine.name}</CardTitle>
              {jobLine.status && (
                <Badge variant="outline" className="text-xs">
                  {jobLine.status}
                </Badge>
              )}
            </div>
            {jobLine.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {jobLine.description}
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Est. Hours:</span>
                <p className="font-medium">{jobLine.estimated_hours || 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Labor Rate:</span>
                <p className="font-medium">${(jobLine.labor_rate || 0).toFixed(2)}/hr</p>
              </div>
              <div>
                <span className="text-muted-foreground">Labor Total:</span>
                <p className="font-medium">${laborTotal.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Parts Total:</span>
                <p className="font-medium">${partsTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
          {isEditMode && (
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(jobLine.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Job Line Total */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-medium">Job Line Total:</span>
          <span className="text-lg font-bold">${jobLineTotal.toFixed(2)}</span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Associated Parts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Associated Parts ({jobLineParts.length})
              </span>
            </div>
            {isEditMode && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddPartsDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Parts
              </Button>
            )}
          </div>

          {jobLineParts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No parts assigned to this job line</p>
              {isEditMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddPartsDialog(true)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Parts
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {jobLineParts.map((part) => (
                <PartDetailsCard
                  key={part.id}
                  part={part}
                  onUpdate={handlePartUpdate}
                  onRemove={handlePartRemove}
                  isEditMode={isEditMode}
                  compact={true}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Parts Dialog */}
      {showAddPartsDialog && (
        <AddPartsDialog
          open={showAddPartsDialog}
          onOpenChange={setShowAddPartsDialog}
          workOrderId={jobLine.work_order_id}
          jobLineId={jobLine.id}
          onPartAdd={handlePartAdd}
        />
      )}
    </Card>
  );
}
