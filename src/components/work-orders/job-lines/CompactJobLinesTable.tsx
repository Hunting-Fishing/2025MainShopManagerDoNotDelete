
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  isEditMode: boolean;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
}

export function CompactJobLinesTable({
  jobLines,
  allParts,
  isEditMode,
  onUpdate,
  onDelete,
  onPartUpdate,
  onPartDelete
}: CompactJobLinesTableProps) {
  const handleEditClick = (jobLine: WorkOrderJobLine) => {
    console.log('Edit job line clicked:', jobLine.id, jobLine.name);
    if (onUpdate) {
      onUpdate(jobLine);
    }
  };

  const handleDeleteClick = (jobLineId: string) => {
    if (confirm('Are you sure you want to delete this job line?')) {
      onDelete?.(jobLineId);
    }
  };

  const handlePartEditClick = (part: WorkOrderPart) => {
    console.log('Edit part clicked:', part.id, part.name);
    if (onPartUpdate) {
      onPartUpdate(part);
    }
  };

  const handlePartDeleteClick = (partId: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      onPartDelete?.(partId);
    }
  };

  if (jobLines.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No job lines found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobLines.map((jobLine) => {
        const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
        
        return (
          <div key={jobLine.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{jobLine.name}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {jobLine.status || 'pending'}
                </Badge>
                {isEditMode && (onUpdate || onDelete) && (
                  <div className="flex gap-1">
                    {onUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(jobLine)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(jobLine.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {jobLine.description && (
              <p className="text-xs text-muted-foreground mb-2">
                {jobLine.description}
              </p>
            )}
            
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div>
                <span className="text-muted-foreground">Hours: </span>
                {jobLine.estimated_hours || 0}
              </div>
              <div>
                <span className="text-muted-foreground">Rate: </span>
                ${jobLine.labor_rate || 0}
              </div>
              <div>
                <span className="text-muted-foreground">Total: </span>
                ${jobLine.total_amount || 0}
              </div>
            </div>

            {jobLineParts.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Associated Parts:
                </div>
                <div className="space-y-2">
                  {jobLineParts.map((part) => (
                    <div key={part.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{part.name}</span>
                          <Badge variant="outline" className="text-xs">
                            Qty: {part.quantity}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          ${part.unit_price} × {part.quantity} = ${part.total_price}
                        </div>
                      </div>
                      {isEditMode && (onPartUpdate || onPartDelete) && (
                        <div className="flex gap-1">
                          {onPartUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePartEditClick(part)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                          {onPartDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePartDeleteClick(part.id)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
