
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package, Plus } from 'lucide-react';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { AddPartsDialog } from '../parts/AddPartsDialog';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartsChange?: (parts: WorkOrderPart[]) => void;
  isEditMode?: boolean;
  parts?: WorkOrderPart[];
}

export function JobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  onPartsChange,
  isEditMode = false,
  parts = []
}: JobLineCardProps) {
  const [isAddPartsOpen, setIsAddPartsOpen] = useState(false);

  const jobLineParts = parts.filter(part => part.job_line_id === jobLine.id);

  const handlePartAdd = (newPart: WorkOrderPart) => {
    if (onPartsChange) {
      onPartsChange([...parts, newPart]);
    }
  };

  const handleRemovePart = (partId: string) => {
    if (onPartsChange) {
      onPartsChange(parts.filter(p => p.id !== partId));
    }
  };

  const handleEditPart = (updatedPart: WorkOrderPart) => {
    if (onPartsChange) {
      onPartsChange(parts.map(p => p.id === updatedPart.id ? updatedPart : p));
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{jobLine.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {jobLine.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{jobLine.status}</Badge>
              {jobLine.category && (
                <Badge variant="secondary">{jobLine.category}</Badge>
              )}
            </div>
          </div>
          
          {isEditMode && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete?.(jobLine.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-sm text-muted-foreground">Hours</span>
            <p className="font-medium">{jobLine.estimated_hours || 0}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Rate</span>
            <p className="font-medium">${jobLine.labor_rate || 0}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Labor</span>
            <p className="font-medium">${(jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Total</span>
            <p className="font-medium font-bold">${jobLine.total_amount || 0}</p>
          </div>
        </div>

        {/* Parts Section */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Parts ({jobLineParts.length})
            </h4>
            {isEditMode && (
              <AddPartsDialog
                workOrderId={jobLine.work_order_id}
                jobLineId={jobLine.id}
                onPartAdd={handlePartAdd}
              />
            )}
          </div>

          <DroppableJobLinePartsSection
            jobLineId={jobLine.id}
            parts={jobLineParts}
            onRemovePart={handleRemovePart}
            onEditPart={handleEditPart}
            isEditMode={isEditMode}
          />
        </div>
      </CardContent>
    </Card>
  );
}
