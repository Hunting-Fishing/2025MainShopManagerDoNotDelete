
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
  onPartsChange?: (parts: WorkOrderPart[]) => void;
}

export function PartsAndLaborTab({
  workOrder,
  jobLines,
  allParts,
  onJobLinesChange,
  isEditMode,
  onPartsChange
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
    if (onPartsChange) {
      const updatedParts = allParts.map(p => p.id === updatedPart.id ? updatedPart : p);
      onPartsChange(updatedParts);
    }
  };

  const handlePartRemove = (partId: string) => {
    if (onPartsChange) {
      const updatedParts = allParts.filter(p => p.id !== partId);
      onPartsChange(updatedParts);
    }
  };

  // Separate parts by whether they're linked to job lines or not
  const partsLinkedToJobLines = allParts.filter(part => part.job_line_id);
  const unlinkedParts = allParts.filter(part => !part.job_line_id);

  // Calculate totals
  const laborTotal = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const partsTotal = allParts.reduce((sum, part) => sum + part.total_price, 0);
  const grandTotal = laborTotal + partsTotal;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Job Lines</p>
                <p className="text-2xl font-bold">{jobLines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Parts</p>
                <p className="text-2xl font-bold">{allParts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Labor Total</p>
              <p className="text-2xl font-bold text-blue-600">${laborTotal.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Parts Total</p>
              <p className="text-2xl font-bold text-purple-600">${partsTotal.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grand Total */}
      <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Grand Total (Labor + Parts)</span>
            <span className="text-3xl font-bold text-green-600">${grandTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Job Lines with their linked parts */}
      <JobLinesGrid
        workOrderId={workOrder.id}
        jobLines={jobLines}
        onUpdate={handleJobLineUpdate}
        onDelete={handleJobLineDelete}
        onJobLinesChange={onJobLinesChange}
        isEditMode={isEditMode}
        parts={allParts}
        onPartsChange={onPartsChange}
      />

      {/* Unlinked Parts Section */}
      {unlinkedParts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Unassigned Parts ({unlinkedParts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unlinkedParts.map((part) => (
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
      )}
    </div>
  );
}
