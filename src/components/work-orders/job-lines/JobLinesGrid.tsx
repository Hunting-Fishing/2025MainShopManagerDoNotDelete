
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineCard } from './JobLineCard';
import { AddJobLineDialog } from './AddJobLineDialog';
import { getJobLineParts } from '@/services/workOrder/workOrderPartsService';

interface JobLinesGridProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onUpdateJobLines?: (jobLines: WorkOrderJobLine[]) => void;
  onAddJobLine?: (jobLine: WorkOrderJobLine) => void;
  onUpdateJobLine?: (jobLine: WorkOrderJobLine) => void;
  onDeleteJobLine?: (jobLineId: string) => void;
  showSummary?: boolean;
  isEditMode?: boolean;
}

export function JobLinesGrid({
  workOrderId,
  jobLines,
  onUpdateJobLines,
  onAddJobLine,
  onUpdateJobLine,
  onDeleteJobLine,
  showSummary = false,
  isEditMode = false
}: JobLinesGridProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [jobLinesWithParts, setJobLinesWithParts] = useState<WorkOrderJobLine[]>([]);
  const [loading, setLoading] = useState(false);

  // Load parts for each job line
  useEffect(() => {
    const loadJobLinesWithParts = async () => {
      setLoading(true);
      try {
        const jobLinesWithPartsData = await Promise.all(
          jobLines.map(async (jobLine) => {
            try {
              const parts = await getJobLineParts(jobLine.id);
              return { ...jobLine, parts };
            } catch (error) {
              console.error(`Error loading parts for job line ${jobLine.id}:`, error);
              return { ...jobLine, parts: [] };
            }
          })
        );
        setJobLinesWithParts(jobLinesWithPartsData);
      } catch (error) {
        console.error('Error loading job lines with parts:', error);
        setJobLinesWithParts(jobLines.map(jl => ({ ...jl, parts: [] })));
      } finally {
        setLoading(false);
      }
    };

    if (jobLines.length > 0) {
      loadJobLinesWithParts();
    } else {
      setJobLinesWithParts([]);
    }
  }, [jobLines]);

  const handleAddJobLine = (newJobLine: WorkOrderJobLine) => {
    onAddJobLine?.(newJobLine);
    setAddDialogOpen(false);
  };

  const handleUpdateJobLine = (updatedJobLine: WorkOrderJobLine) => {
    onUpdateJobLine?.(updatedJobLine);
    // Refresh the job lines with parts
    setJobLinesWithParts(prev => 
      prev.map(jl => jl.id === updatedJobLine.id ? { ...updatedJobLine, parts: jl.parts } : jl)
    );
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    onDeleteJobLine?.(jobLineId);
    setJobLinesWithParts(prev => prev.filter(jl => jl.id !== jobLineId));
  };

  const refreshJobLineParts = async (jobLineId: string) => {
    try {
      const parts = await getJobLineParts(jobLineId);
      setJobLinesWithParts(prev => 
        prev.map(jl => jl.id === jobLineId ? { ...jl, parts } : jl)
      );
    } catch (error) {
      console.error('Error refreshing job line parts:', error);
    }
  };

  // Calculate totals
  const totalLabor = jobLinesWithParts.reduce((sum, jl) => sum + (jl.totalAmount || 0), 0);
  const totalParts = jobLinesWithParts.reduce((sum, jl) => 
    sum + (jl.parts?.reduce((partSum, part) => partSum + (part.customerPrice * part.quantity), 0) || 0), 0
  );
  const grandTotal = totalLabor + totalParts;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Services & Job Lines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading job lines...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Services & Job Lines</CardTitle>
            <Badge variant="secondary">{jobLinesWithParts.length}</Badge>
          </div>
          {isEditMode && (
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          )}
        </div>
        
        {showSummary && jobLinesWithParts.length > 0 && (
          <div className="flex gap-6 text-sm text-slate-600">
            <span>Labor: ${totalLabor.toFixed(2)}</span>
            <span>Parts: ${totalParts.toFixed(2)}</span>
            <span className="font-medium text-slate-900">Total: ${grandTotal.toFixed(2)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {jobLinesWithParts.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <Briefcase className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 mb-4">No services added yet</p>
            {isEditMode ? (
              <p className="text-sm text-slate-400">
                Add services and job lines for this work order
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Services will appear here when added in edit mode
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobLinesWithParts.map((jobLine) => (
              <JobLineCard
                key={jobLine.id}
                jobLine={jobLine}
                onUpdate={handleUpdateJobLine}
                onDelete={handleDeleteJobLine}
                onAddParts={() => refreshJobLineParts(jobLine.id)}
                isEditMode={isEditMode}
              />
            ))}
          </div>
        )}
      </CardContent>

      {isEditMode && (
        <AddJobLineDialog
          workOrderId={workOrderId}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onJobLineAdd={handleAddJobLine}
        />
      )}
    </Card>
  );
}
