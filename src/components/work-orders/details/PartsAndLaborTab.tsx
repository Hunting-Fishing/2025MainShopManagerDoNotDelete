
import React from 'react';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { PartsInventorySummary } from '../parts/PartsInventorySummary';
import { PartDetailsCard } from '../parts/PartDetailsCard';
import { Package, Wrench } from 'lucide-react';

interface PartsAndLaborTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function PartsAndLaborTab({
  workOrder,
  jobLines,
  allParts,
  onJobLinesChange,
  isEditMode
}: PartsAndLaborTabProps) {
  const handleJobLineUpdate = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(jl => 
      jl.id === updatedJobLine.id ? updatedJobLine : jl
    );
    onJobLinesChange(updatedJobLines);
  };

  const handleJobLineDelete = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(jl => jl.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  const handlePartUpdate = (updatedPart: WorkOrderPart) => {
    // Handle part updates if needed
    console.log('Part updated:', updatedPart);
  };

  const handlePartRemove = (partId: string) => {
    // Handle part removal if needed
    console.log('Part removed:', partId);
  };

  return (
    <div className="space-y-6">
      {/* Parts Section */}
      {allParts.length > 0 && (
        <div className="space-y-4">
          <PartsInventorySummary parts={allParts} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parts Details ({allParts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allParts.map((part) => (
                  <PartDetailsCard
                    key={part.id}
                    part={part}
                    onUpdate={handlePartUpdate}
                    onRemove={handlePartRemove}
                    isEditMode={isEditMode}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Labor Section */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Labor Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Job Lines</p>
                <p className="text-2xl font-bold">{jobLines.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">
                  {jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Labor Cost</p>
                <p className="text-2xl font-bold">
                  ${jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <JobLinesGrid
          workOrderId={workOrder.id}
          jobLines={jobLines}
          onUpdate={handleJobLineUpdate}
          onDelete={handleJobLineDelete}
          onJobLinesChange={onJobLinesChange}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
}
