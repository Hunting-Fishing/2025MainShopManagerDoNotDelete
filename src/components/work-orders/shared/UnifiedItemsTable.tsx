
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { formatTimeInHoursAndMinutes } from '@/utils/dateUtils';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  onReorderJobLines?: (jobLines: WorkOrderJobLine[]) => void;
  onReorderParts?: (parts: WorkOrderPart[]) => void;
  isEditMode?: boolean;
  showType?: 'overview' | 'labor' | 'parts';
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode = false,
  showType = 'overview'
}: UnifiedItemsTableProps) {
  const [expandedJobLines, setExpandedJobLines] = useState<Set<string>>(new Set());

  const toggleJobLineExpansion = (jobLineId: string) => {
    const newExpanded = new Set(expandedJobLines);
    if (newExpanded.has(jobLineId)) {
      newExpanded.delete(jobLineId);
    } else {
      newExpanded.add(jobLineId);
    }
    setExpandedJobLines(newExpanded);
  };

  const getJobLineParts = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'installed':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (jobLines.length === 0 && allParts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No labor or parts have been added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobLines.map((jobLine) => {
        const jobLineParts = getJobLineParts(jobLine.id);
        const isExpanded = expandedJobLines.has(jobLine.id);
        const hasPartsToShow = jobLineParts.length > 0;

        return (
          <Card key={jobLine.id} className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {hasPartsToShow && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleJobLineExpansion(jobLine.id)}
                      className="h-6 w-6 p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base font-medium">
                        {jobLine.name}
                      </CardTitle>
                      <Badge variant={getStatusBadgeVariant(jobLine.status || 'pending')}>
                        {jobLine.status || 'pending'}
                      </Badge>
                    </div>
                    {jobLine.description && (
                      <p className="text-sm text-muted-foreground">
                        {jobLine.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs">Hours</div>
                    <div className="font-medium">
                      {jobLine.estimated_hours ? `${jobLine.estimated_hours}h` : '0h'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs">Rate</div>
                    <div className="font-medium">
                      ${jobLine.labor_rate || 0}/hr
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs">Total</div>
                    <div className="font-semibold">
                      ${jobLine.total_amount || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs">Status</div>
                    <Badge variant={getStatusBadgeVariant(jobLine.status || 'pending')} className="text-xs">
                      {jobLine.status || 'pending'}
                    </Badge>
                  </div>
                  
                  {isEditMode && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onJobLineUpdate?.(jobLine)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onJobLineDelete?.(jobLine.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {!hasPartsToShow && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <div className="w-6"></div>
                  <span>No parts associated with this job line</span>
                </div>
              )}
            </CardHeader>

            {hasPartsToShow && isExpanded && (
              <CardContent className="pt-0">
                <div className="ml-9 border-t pt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Associated Parts ({jobLineParts.length})
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {jobLineParts.map((part) => (
                      <div key={part.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {part.name}
                            </span>
                            <Badge variant={getStatusBadgeVariant(part.status || 'pending')} className="text-xs">
                              {part.status || 'pending'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {part.part_number} • Qty: {part.quantity}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground text-xs">Unit Price</div>
                            <div className="font-medium">${part.unit_price}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground text-xs">Total</div>
                            <div className="font-semibold">${part.total_price}</div>
                          </div>
                          
                          {isEditMode && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPartUpdate?.(part)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPartDelete?.(part.id)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
