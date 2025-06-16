
import React, { useState, useEffect } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

interface JobLinesSectionProps {
  workOrderId: string;
  description?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
  shopId?: string;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  isEditMode,
  shopId
}: JobLinesSectionProps) {
  const handleEditJobLine = (jobLine: WorkOrderJobLine) => {
    console.log('Edit job line clicked:', jobLine.id, jobLine.name);
    // TODO: Implement job line edit dialog
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    if (confirm('Are you sure you want to delete this job line?')) {
      const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
      onJobLinesChange(updatedJobLines);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Job Lines (Labor)</CardTitle>
          {isEditMode && (
            <Button size="sm" className="h-8 px-3">
              <Plus className="h-4 w-4 mr-2" />
              Add Job Line
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {jobLines.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No job lines found
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
              <div className="col-span-5">Item</div>
              <div className="col-span-2">Hours</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-2">Amount</div>
              {isEditMode && <div className="col-span-1">Actions</div>}
            </div>

            {jobLines.map((jobLine) => (
              <div key={jobLine.id} className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 hover:bg-gray-50">
                <div className="col-span-5">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
