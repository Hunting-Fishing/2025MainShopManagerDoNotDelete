
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
}

export function CompactJobLinesTable({
  jobLines,
  allParts,
  isEditMode,
  onUpdate,
  onDelete
}: CompactJobLinesTableProps) {
  const handleEditClick = (jobLine: WorkOrderJobLine) => {
    console.log('Edit job line clicked:', jobLine.id, jobLine.name);
    // TODO: Implement job line edit dialog
    if (onUpdate) {
      // For now, just call the update function with the same data
      onUpdate(jobLine);
    }
  };

  const handleDeleteClick = (jobLineId: string) => {
    if (confirm('Are you sure you want to delete this job line?')) {
      onDelete?.(jobLineId);
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
    <div className="space-y-3">
      {jobLines.map((jobLine) => {
        const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
        
        return (
          <div key={jobLine.id} className="border rounded p-3">
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
            
            <div className="grid grid-cols-3 gap-2 text-xs">
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
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Parts: {jobLineParts.length} item(s)
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
