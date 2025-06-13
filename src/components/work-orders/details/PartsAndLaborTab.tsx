
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobLineCard } from '../job-lines/JobLineCard';
import { Wrench, Package } from 'lucide-react';

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
  // Group parts by job line
  const partsByJobLine = allParts.reduce((acc, part) => {
    const jobLineId = part.job_line_id || 'unlinked';
    if (!acc[jobLineId]) acc[jobLineId] = [];
    acc[jobLineId].push(part);
    return acc;
  }, {} as Record<string, WorkOrderPart[]>);

  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalPartsCost = allParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);

  const handleJobLineUpdate = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(line => 
      line.id === updatedJobLine.id ? updatedJobLine : line
    );
    onJobLinesChange(updatedJobLines);
  };

  const handleJobLineDelete = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  const handlePartsChange = (newParts: WorkOrderPart[]) => {
    // This would need to be passed up to parent component to update all parts
    console.log('Parts changed:', newParts);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Labor</p>
                <p className="text-2xl font-bold">${totalLaborCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{totalEstimatedHours.toFixed(1)} hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Parts</p>
                <p className="text-2xl font-bold">${totalPartsCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{allParts.length} items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium">Grand Total</p>
              <p className="text-2xl font-bold">${(totalLaborCost + totalPartsCost).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Labor + Parts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Lines with Parts */}
      <Card>
        <CardHeader>
          <CardTitle>Labor & Parts Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {jobLines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No job lines found for this work order</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobLines.map((jobLine) => (
                <JobLineCard
                  key={jobLine.id}
                  jobLine={jobLine}
                  onUpdate={handleJobLineUpdate}
                  onDelete={handleJobLineDelete}
                  onPartsChange={handlePartsChange}
                  isEditMode={isEditMode}
                  parts={partsByJobLine[jobLine.id] || []}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unlinked Parts */}
      {partsByJobLine.unlinked && partsByJobLine.unlinked.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-700">Unlinked Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700 mb-3">
                These parts are not associated with any job line:
              </p>
              <div className="space-y-2">
                {partsByJobLine.unlinked.map((part) => (
                  <div key={part.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{part.name}</span>
                      {part.part_number && (
                        <span className="text-muted-foreground ml-2">({part.part_number})</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">Qty: {part.quantity}</span>
                      <span className="font-medium ml-2">${part.total_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
