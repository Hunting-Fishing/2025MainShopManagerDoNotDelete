
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts?: WorkOrderPart[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode?: boolean;
}

export function CompactJobLinesTable({
  jobLines,
  allParts = [],
  onUpdate,
  onDelete,
  onPartUpdate,
  onPartDelete,
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
        {jobLines.map((jobLine) => {
          // Get parts for this job line
          const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
          
          return (
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

                  {/* Show parts for this job line */}
                  {jobLineParts.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="text-sm font-medium mb-2">Parts ({jobLineParts.length})</h5>
                      <div className="space-y-1">
                        {jobLineParts.map((part) => (
                          <div key={part.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                            <div className="flex-1">
                              <span className="font-medium">{part.name}</span>
                              {part.part_number && (
                                <span className="text-gray-500 ml-2">({part.part_number})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Qty: {part.quantity}</span>
                              <span>${part.total_price?.toFixed(2) || '0.00'}</span>
                              {isEditMode && onPartUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onPartUpdate(part)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              )}
                              {isEditMode && onPartDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onPartDelete(part.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
          );
        })}
      </div>
    </div>
  );
}
