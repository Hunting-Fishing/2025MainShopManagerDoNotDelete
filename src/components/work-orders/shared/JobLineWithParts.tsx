
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Wrench, Package, Plus, Edit, Trash2 } from 'lucide-react';
import { PartAssignmentControls } from '../parts/PartAssignmentControls';

interface JobLineWithPartsProps {
  jobLine: WorkOrderJobLine;
  jobLineParts: WorkOrderPart[];
  onPartUpdate?: (updatedPart: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
  onPartsChange: () => void;
  isEditMode: boolean;
}

export function JobLineWithParts({
  jobLine,
  jobLineParts,
  onPartUpdate,
  onPartDelete,
  onPartsChange,
  isEditMode
}: JobLineWithPartsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalPartsValue = jobLineParts.reduce((sum, part) => sum + part.total_price, 0);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded">
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Wrench className="h-4 w-4 text-blue-500" />
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {jobLine.name}
                    {jobLine.status && (
                      <Badge className={getStatusColor(jobLine.status)}>
                        {jobLine.status}
                      </Badge>
                    )}
                  </CardTitle>
                  {jobLine.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {jobLine.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {jobLineParts.length} parts
                </div>
                <div className="font-medium">
                  ${totalPartsValue.toFixed(2)}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {jobLineParts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No parts assigned to this job line</p>
                {isEditMode && (
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Part
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {jobLineParts.map((part) => (
                  <div key={part.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{part.name}</h4>
                          {part.status && (
                            <Badge className={getStatusColor(part.status)}>
                              {part.status}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>Part #: {part.part_number}</div>
                          <div>Qty: {part.quantity}</div>
                          <div>Unit Price: ${part.unit_price}</div>
                          <div>Total: ${part.total_price}</div>
                        </div>
                        {part.description && (
                          <p className="text-sm text-muted-foreground mt-2">{part.description}</p>
                        )}
                        {part.notes && (
                          <p className="text-sm text-blue-600 mt-1">Note: {part.notes}</p>
                        )}
                      </div>
                      
                      {isEditMode && (
                        <div className="ml-4 flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            onClick={() => {/* TODO: Implement edit */}}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-red-600 hover:text-red-700"
                            onClick={async () => {
                              if (confirm(`Remove ${part.name} from this job line?`)) {
                                if (onPartUpdate) {
                                  await onPartUpdate({ ...part, job_line_id: undefined });
                                  onPartsChange();
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Job Line Summary */}
            {jobLine.estimated_hours && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Estimated Hours:</span>
                    <span className="ml-1 font-medium">{jobLine.estimated_hours}h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Labor Rate:</span>
                    <span className="ml-1 font-medium">${jobLine.labor_rate || 0}/hr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Labor:</span>
                    <span className="ml-1 font-medium">
                      ${((jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
