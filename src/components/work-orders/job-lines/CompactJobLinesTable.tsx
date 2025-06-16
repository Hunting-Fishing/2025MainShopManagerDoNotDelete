
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowRight } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';
import { partStatusMap } from '@/types/workOrderPart';
import { JobLineEditDialog } from './JobLineEditDialog';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts?: WorkOrderPart[];
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
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
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);

  const handleEditJobLine = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
  };

  const handleUpdateJobLine = async (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      onUpdate(updatedJobLine);
    }
    setEditingJobLine(null);
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    if (onDelete) {
      onDelete(jobLineId);
    }
  };

  const getJobLineParts = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  if (jobLines.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No job lines added yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {jobLines.map((jobLine) => {
          const jobLineParts = getJobLineParts(jobLine.id);
          const totalAmount = (jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0);

          return (
            <div key={jobLine.id} className="border rounded-lg bg-white">
              {/* Job Line Row */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-sm">{jobLine.name}</h4>
                      {jobLine.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          jobLineStatusMap[jobLine.status]?.classes || 'bg-gray-100 text-gray-800'
                        }`}>
                          {jobLineStatusMap[jobLine.status]?.label || jobLine.status}
                        </span>
                      )}
                    </div>
                    
                    {jobLine.description && (
                      <p className="text-xs text-muted-foreground mt-1">{jobLine.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {jobLine.estimated_hours && (
                        <span>{jobLine.estimated_hours}h</span>
                      )}
                      {jobLine.labor_rate && (
                        <span>${jobLine.labor_rate}/hr</span>
                      )}
                      {totalAmount > 0 && (
                        <span className="font-medium text-gray-900">${totalAmount.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  
                  {isEditMode && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditJobLine(jobLine)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJobLine(jobLine.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Parts Rows */}
              {jobLineParts.length > 0 && (
                <div className="bg-gray-50">
                  {jobLineParts.map((part) => (
                    <div key={part.id} className="p-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0 ml-4" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm">{part.name}</span>
                            {part.status && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                partStatusMap[part.status]?.classes || 'bg-gray-100 text-gray-800'
                              }`}>
                                {partStatusMap[part.status]?.label || part.status}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Part #: {part.part_number}</span>
                            <span>Qty: {part.quantity}</span>
                            <span>${part.unit_price}/ea</span>
                            <span className="font-medium text-gray-900">
                              ${part.total_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {isEditMode && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onPartDelete?.(part.id)}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
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
            </div>
          );
        })}
      </div>

      {editingJobLine && (
        <JobLineEditDialog
          jobLine={editingJobLine}
          open={!!editingJobLine}
          onOpenChange={(open) => !open && setEditingJobLine(null)}
          onSave={handleUpdateJobLine}
        />
      )}
    </>
  );
}
