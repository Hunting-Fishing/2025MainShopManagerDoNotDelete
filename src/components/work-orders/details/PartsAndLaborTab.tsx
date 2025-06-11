
import React, { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, Package } from 'lucide-react';
import { JobLineCard } from '../job-lines/JobLineCard';
import { PartDetailsCard } from '../parts/PartDetailsCard';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface PartsAndLaborTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
}

export function PartsAndLaborTab({
  workOrder,
  jobLines,
  onJobLinesChange,
  isEditMode = false
}: PartsAndLaborTabProps) {
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParts();
  }, [workOrder.id]);

  const fetchParts = async () => {
    try {
      setIsLoading(true);
      const partsData = await getWorkOrderParts(workOrder.id);
      setAllParts(partsData);
    } catch (error) {
      console.error('Error fetching parts:', error);
      toast.error('Failed to load parts');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handlePartRemove = (partId: string) => {
    setAllParts(prev => prev.filter(p => p.id !== partId));
  };

  const getPartsForJobLine = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  const unassignedParts = allParts.filter(part => !part.job_line_id);

  const calculateTotals = () => {
    const laborTotal = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
    const partsTotal = allParts.reduce((sum, part) => sum + part.total_price, 0);
    return { laborTotal, partsTotal, grandTotal: laborTotal + partsTotal };
  };

  const { laborTotal, partsTotal, grandTotal } = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading parts and labor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Labor Total</p>
                <p className="text-2xl font-bold">${laborTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Parts Total</p>
                <p className="text-2xl font-bold">${partsTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-purple-500 rounded"></div>
              <div>
                <p className="text-sm text-muted-foreground">Grand Total</p>
                <p className="text-2xl font-bold">${grandTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Lines with Associated Parts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Labor & Associated Parts
            </CardTitle>
            {isEditMode && (
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Job Line
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {jobLines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No job lines added yet</p>
              {isEditMode && (
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Job Line
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {jobLines.map((jobLine) => {
                const jobLineParts = getPartsForJobLine(jobLine.id);
                return (
                  <div key={jobLine.id} className="border rounded-lg p-4">
                    <JobLineCard
                      jobLine={jobLine}
                      onEdit={handleJobLineUpdate}
                      onDelete={handleJobLineDelete}
                      isEditMode={isEditMode}
                    />
                    
                    {/* Associated Parts for this Job Line */}
                    {jobLineParts.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                          Associated Parts ({jobLineParts.length})
                        </h4>
                        <div className="space-y-2">
                          {jobLineParts.map((part) => (
                            <PartDetailsCard
                              key={part.id}
                              part={part}
                              onRemove={handlePartRemove}
                              isEditMode={isEditMode}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unassigned Parts */}
      {unassignedParts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Unassigned Parts ({unassignedParts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unassignedParts.map((part) => (
                <PartDetailsCard
                  key={part.id}
                  part={part}
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
