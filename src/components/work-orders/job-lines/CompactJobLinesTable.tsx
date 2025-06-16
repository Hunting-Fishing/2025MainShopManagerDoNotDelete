
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Badge } from '@/components/ui/badge';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  isEditMode: boolean;
}

export function CompactJobLinesTable({
  jobLines,
  allParts,
  isEditMode
}: CompactJobLinesTableProps) {
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
              <Badge variant="outline" className="text-xs">
                {jobLine.status || 'pending'}
              </Badge>
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
