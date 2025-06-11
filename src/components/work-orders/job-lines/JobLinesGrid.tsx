
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, RefreshCw } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { getJobLineParts } from '@/services/workOrder/workOrderPartsService';
import { JobLineCard } from './JobLineCard';
import { AddJobLineDialog } from './AddJobLineDialog';

interface JobLinesGridProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  showSummary?: boolean;
  isEditMode?: boolean;
}

export function JobLinesGrid({
  workOrderId,
  jobLines,
  onUpdate,
  onDelete,
  onJobLinesChange,
  showSummary = false,
  isEditMode = false
}: JobLinesGridProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [jobLinesWithParts, setJobLinesWithParts] = useState<WorkOrderJobLine[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load parts for each job line
  const loadPartsForJobLines = async (jobLinesToLoad: WorkOrderJobLine[]) => {
    console.log('Loading parts for job lines in grid:', jobLinesToLoad);
    try {
      const jobLinesWithPartsData = await Promise.all(
        jobLinesToLoad.map(async (jobLine) => {
          try {
            const parts = await getJobLineParts(jobLine.id);
            console.log(`Parts loaded for job line ${jobLine.id}:`, parts);
            return { ...jobLine, parts };
          } catch (error) {
            console.error(`Error loading parts for job line ${jobLine.id}:`, error);
            return { ...jobLine, parts: [] };
          }
        })
      );
      setJobLinesWithParts(jobLinesWithPartsData);
    } catch (error) {
      console.error('Error loading parts for job lines:', error);
      setJobLinesWithParts(jobLinesToLoad.map(jl => ({ ...jl, parts: [] })));
    }
  };

  useEffect(() => {
    if (jobLines.length > 0) {
      loadPartsForJobLines(jobLines);
    } else {
      setJobLinesWithParts([]);
    }
  }, [jobLines]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPartsForJobLines(jobLines);
    setRefreshing(false);
  };

  const handleUpdateJobLine = (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      onUpdate(updatedJobLine);
    }
    if (onJobLinesChange) {
      const updatedLines = jobLines.map((line) =>
        line.id === updatedJobLine.id ? updatedJobLine : line
      );
      onJobLinesChange(updatedLines);
    }
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    if (onDelete) {
      onDelete(jobLineId);
    }
    if (onJobLinesChange) {
      const updatedLines = jobLines.filter((line) => line.id !== jobLineId);
      onJobLinesChange(updatedLines);
    }
  };

  const handleAddJobLines = (newJobLinesData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (onJobLinesChange) {
      const newJobLines: WorkOrderJobLine[] = newJobLinesData.map(jobLineData => ({
        ...jobLineData,
        id: `temp-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const updatedJobLines = [...jobLines, ...newJobLines];
      onJobLinesChange(updatedJobLines);
    }
    setAddDialogOpen(false);
  };

  const calculateTotals = () => {
    const laborTotal = jobLinesWithParts.reduce((total, line) => total + (line.totalAmount || 0), 0);
    const partsTotal = jobLinesWithParts.reduce((total, line) => {
      return total + (line.parts?.reduce((partTotal, part) => 
        partTotal + (part.customerPrice * part.quantity), 0) || 0);
    }, 0);
    return { laborTotal, partsTotal, grandTotal: laborTotal + partsTotal };
  };

  const totals = calculateTotals();

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Job Lines
            {jobLinesWithParts.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({jobLinesWithParts.length})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {isEditMode && (
              <Button
                onClick={() => setAddDialogOpen(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Job Line
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobLinesWithParts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No job lines added yet</p>
              {isEditMode && (
                <p className="text-sm mt-2">Click "Add Job Line" to get started</p>
              )}
            </div>
          ) : (
            <>
              {jobLinesWithParts.map((jobLine) => (
                <JobLineCard
                  key={jobLine.id}
                  jobLine={jobLine}
                  onUpdate={handleUpdateJobLine}
                  onDelete={handleDeleteJobLine}
                  onPartsUpdate={handleRefresh}
                  isEditMode={isEditMode}
                />
              ))}

              {showSummary && (
                <div className="border-t pt-4 mt-6">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-right">
                      <span className="text-muted-foreground">Labor Total:</span>
                      <span className="ml-2 font-medium">${totals.laborTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">Parts Total:</span>
                      <span className="ml-2 font-medium">${totals.partsTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">Grand Total:</span>
                      <span className="ml-2 font-semibold text-green-600">${totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>

      {isEditMode && (
        <AddJobLineDialog
          workOrderId={workOrderId}
          onJobLineAdd={handleAddJobLines}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
        />
      )}
    </Card>
  );
}
