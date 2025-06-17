
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface JobLineWithPartsProps {
  jobLine: WorkOrderJobLine;
  attachedParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  onAddPart?: (jobLineId: string) => void;
  isEditMode: boolean;
}

export function JobLineWithParts({
  jobLine,
  attachedParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  onAddPart,
  isEditMode
}: JobLineWithPartsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleEditJobLine = () => {
    if (onJobLineUpdate) {
      onJobLineUpdate(jobLine);
    }
  };

  const handleDeleteJobLine = () => {
    if (onJobLineDelete && confirm('Are you sure you want to delete this job line?')) {
      onJobLineDelete(jobLine.id);
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    if (onPartUpdate) {
      onPartUpdate(part);
    }
  };

  const handleDeletePart = (partId: string) => {
    if (onPartDelete && confirm('Are you sure you want to delete this part?')) {
      onPartDelete(partId);
    }
  };

  const handleAddPart = () => {
    if (onAddPart) {
      onAddPart(jobLine.id);
    }
  };

  const partsTotal = attachedParts.reduce((total, part) => total + (part.total_price || 0), 0);
  const jobLineTotal = (jobLine.total_amount || 0) + partsTotal;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-6 w-6"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{jobLine.name}</CardTitle>
                <Badge variant="outline">{jobLine.status || 'pending'}</Badge>
                {attachedParts.length > 0 && (
                  <Badge variant="secondary">{attachedParts.length} part{attachedParts.length !== 1 ? 's' : ''}</Badge>
                )}
              </div>
              {jobLine.description && (
                <p className="text-sm text-muted-foreground">
                  {jobLine.description}
                </p>
              )}
            </div>
          </div>
          {isEditMode && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddPart}
                title="Add Part"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditJobLine}
                title="Edit Job Line"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteJobLine}
                title="Delete Job Line"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {/* Job Line Details */}
          <div className="grid grid-cols-4 gap-4 text-sm mb-4 p-3 bg-muted/30 rounded">
            <div>
              <span className="text-muted-foreground">Hours: </span>
              {jobLine.estimated_hours || 0}
            </div>
            <div>
              <span className="text-muted-foreground">Rate: </span>
              ${jobLine.labor_rate || 0}
            </div>
            <div>
              <span className="text-muted-foreground">Labor: </span>
              ${jobLine.total_amount || 0}
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Total: </span>
              <span className="font-medium">${jobLineTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Attached Parts */}
          {attachedParts.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-3 text-muted-foreground">Parts & Materials:</h5>
              <div className="space-y-2">
                {attachedParts.map((part) => (
                  <div key={part.id} className="border rounded p-3 bg-background">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{part.name}</span>
                          {part.status && (
                            <Badge variant="outline" className="text-xs">
                              {part.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Part #: {part.part_number}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Qty: </span>
                            {part.quantity}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price: </span>
                            ${part.unit_price}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total: </span>
                            ${part.total_price}
                          </div>
                        </div>
                        {part.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {part.description}
                          </p>
                        )}
                      </div>
                      {isEditMode && (
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPart(part)}
                            title="Edit Part"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePart(part.id)}
                            title="Delete Part"
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
          )}
          
          {attachedParts.length === 0 && isEditMode && (
            <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded">
              <p className="text-sm mb-2">No parts assigned to this job line</p>
              <Button variant="outline" size="sm" onClick={handleAddPart}>
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
