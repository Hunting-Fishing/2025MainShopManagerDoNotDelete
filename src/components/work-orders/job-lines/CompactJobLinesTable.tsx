
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, ChevronDown, ChevronRight, ArrowDownRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode: boolean;
}

export function CompactJobLinesTable({
  jobLines,
  allParts,
  onUpdate,
  onDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode
}: CompactJobLinesTableProps) {
  const [expandedJobLines, setExpandedJobLines] = useState<Set<string>>(new Set());

  const toggleJobLine = (jobLineId: string) => {
    const newExpanded = new Set(expandedJobLines);
    if (newExpanded.has(jobLineId)) {
      newExpanded.delete(jobLineId);
    } else {
      newExpanded.add(jobLineId);
    }
    setExpandedJobLines(newExpanded);
  };

  const handleEditJobLine = (jobLine: WorkOrderJobLine) => {
    console.log('Edit job line clicked:', jobLine.id, jobLine.name);
    // TODO: Implement job line edit dialog
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    if (confirm('Are you sure you want to delete this job line?')) {
      onDelete?.(jobLineId);
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    console.log('Edit part clicked:', part.id, part.name);
    // TODO: Implement part edit dialog
  };

  const handleDeletePart = (partId: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      onPartDelete?.(partId);
    }
  };

  if (jobLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No job lines found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
        <div className="col-span-1"></div>
        <div className="col-span-4">Item</div>
        <div className="col-span-2">Qty</div>
        <div className="col-span-2">Rate/Price</div>
        <div className="col-span-2">Amount</div>
        {isEditMode && <div className="col-span-1">Actions</div>}
      </div>

      {jobLines.map((jobLine) => {
        const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
        const isExpanded = expandedJobLines.has(jobLine.id);
        const hasPartsToShow = jobLineParts.length > 0;

        return (
          <Collapsible
            key={jobLine.id}
            open={isExpanded}
            onOpenChange={() => toggleJobLine(jobLine.id)}
          >
            {/* Job Line Row */}
            <div className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 hover:bg-gray-50">
              <div className="col-span-1 flex items-center">
                {hasPartsToShow && (
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
              <div className="col-span-4">
                <div className="font-medium text-sm">{jobLine.name}</div>
                {jobLine.description && (
                  <div className="text-xs text-muted-foreground">{jobLine.description}</div>
                )}
                <Badge variant="outline" className="text-xs mt-1">
                  Labor
                </Badge>
              </div>
              <div className="col-span-2 text-sm">
                {jobLine.estimated_hours || 0} hrs
              </div>
              <div className="col-span-2 text-sm">
                ${jobLine.labor_rate || 0}/hr
              </div>
              <div className="col-span-2 text-sm font-medium">
                ${jobLine.total_amount || 0}
              </div>
              {isEditMode && (
                <div className="col-span-1 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleEditJobLine(jobLine)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDeleteJobLine(jobLine.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Connected Parts (Expandable) */}
            {hasPartsToShow && (
              <CollapsibleContent className="space-y-1">
                {jobLineParts.map((part, index) => (
                  <div key={part.id} className="grid grid-cols-12 gap-2 py-1 bg-blue-50/50">
                    <div className="col-span-1 flex items-center justify-center">
                      <ArrowDownRight className="h-3 w-3 text-blue-500" />
                    </div>
                    <div className="col-span-4">
                      <div className="text-sm font-medium">{part.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Part #: {part.part_number}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Part
                      </Badge>
                    </div>
                    <div className="col-span-2 text-sm">
                      {part.quantity}
                    </div>
                    <div className="col-span-2 text-sm">
                      ${part.unit_price}
                    </div>
                    <div className="col-span-2 text-sm font-medium">
                      ${part.total_price}
                    </div>
                    {isEditMode && (
                      <div className="col-span-1 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleEditPart(part)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeletePart(part.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            )}
          </Collapsible>
        );
      })}
    </div>
  );
}
