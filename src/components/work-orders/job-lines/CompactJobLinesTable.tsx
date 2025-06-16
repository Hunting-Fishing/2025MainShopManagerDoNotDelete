
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  isEditMode?: boolean;
}

export function CompactJobLinesTable({
  jobLines,
  onUpdate,
  onDelete,
  isEditMode = false
}: CompactJobLinesTableProps) {
  if (!jobLines || jobLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job lines added yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {jobLines.map((jobLine) => (
          <div key={jobLine.id} className="border rounded-lg p-4 bg-card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{jobLine.name}</h4>
                  <Badge 
                    variant="secondary" 
                    className={jobLineStatusMap[jobLine.status || 'pending']?.classes}
                  >
                    {jobLineStatusMap[jobLine.status || 'pending']?.label}
                  </Badge>
                </div>
                
                {jobLine.category && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Category: {jobLine.category}
                    {jobLine.subcategory && ` > ${jobLine.subcategory}`}
                  </p>
                )}
                
                {jobLine.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {jobLine.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  {jobLine.estimated_hours && (
                    <span>Hours: {jobLine.estimated_hours}</span>
                  )}
                  {jobLine.labor_rate && (
                    <span>Rate: ${jobLine.labor_rate}/hr</span>
                  )}
                  {jobLine.total_amount && (
                    <span className="font-medium">
                      Total: ${jobLine.total_amount.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {jobLine.notes && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Notes: {jobLine.notes}
                  </p>
                )}
              </div>
              
              {isEditMode && (
                <div className="flex items-center gap-1 ml-4">
                  {onUpdate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdate(jobLine)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(jobLine.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
