
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { JobLineEditDialog } from './JobLineEditDialog';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { JobLinePartsDisplay } from './JobLinePartsDisplay';
import { Badge } from '@/components/ui/badge';
import { WorkOrderJobLine } from '@/types/jobLine';
import { calculateTotalJobLineAmount, calculateTotalEstimatedHours, calculateTotalPartsCost } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export interface JobLinesGridProps {
  workOrderId?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => Promise<void>;
  onDelete?: (jobLineId: string) => Promise<void>;
  isEditMode?: boolean;
  showSummary?: boolean;
}

export function JobLinesGrid({ 
  workOrderId, 
  jobLines, 
  onJobLinesChange, 
  onUpdate,
  onDelete,
  isEditMode = false,
  showSummary = true
}: JobLinesGridProps) {
  const [editingJobLine, setEditingJobLine] = React.useState<WorkOrderJobLine | null>(null);
  const [addingPartsToJobLine, setAddingPartsToJobLine] = React.useState<WorkOrderJobLine | null>(null);
  const [jobLinesWithParts, setJobLinesWithParts] = React.useState<WorkOrderJobLine[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    loadJobLinesWithParts();
  }, [jobLines]);

  const loadJobLinesWithParts = () => {
    const updatedJobLines = jobLines.map(jobLine => ({
      ...jobLine,
      totalAmount: calculateTotalJobLineAmount(jobLine)
    }));
    setJobLinesWithParts(updatedJobLines);
  };

  const handleRemoveJobLine = async (jobLineId: string) => {
    if (onDelete) {
      await onDelete(jobLineId);
    } else if (onJobLinesChange) {
      const updatedJobLines = jobLines.filter(jl => jl.id !== jobLineId);
      onJobLinesChange(updatedJobLines);
    }
  };

  const handlePartsAdded = () => {
    loadJobLinesWithParts();
    setAddingPartsToJobLine(null);
  };

  const handleEditJobLine = async (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      await onUpdate(updatedJobLine);
    } else if (onJobLinesChange) {
      const updatedJobLines = jobLines.map(jl => 
        jl.id === updatedJobLine.id ? updatedJobLine : jl
      );
      onJobLinesChange(updatedJobLines);
    }
    setEditingJobLine(null);
  };

  const totalEstimatedHours = calculateTotalEstimatedHours(jobLines);
  const totalPartsCost = calculateTotalPartsCost(jobLines);
  const totalJobLinesAmount = jobLines.reduce((acc, jobLine) => acc + (jobLine.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Total Job Lines
            </h4>
            <div className="text-2xl font-bold">{jobLines.length}</div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Total Estimated Hours
            </h4>
            <div className="text-2xl font-bold">{totalEstimatedHours}</div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Total Parts Cost
            </h4>
            <div className="text-2xl font-bold">${totalPartsCost}</div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Total Job Lines Amount
            </h4>
            <div className="text-2xl font-bold">${totalJobLinesAmount}</div>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {jobLinesWithParts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No job lines added yet
          </div>
        ) : (
          jobLinesWithParts.map((jobLine) => (
            <Card key={jobLine.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{jobLine.name}</h4>
                    <Badge variant="outline">
                      {jobLine.status}
                    </Badge>
                  </div>
                  
                  {jobLine.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {jobLine.description}
                    </p>
                  )}
                  
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {jobLine.estimatedHours && (
                      <span>Hours: {jobLine.estimatedHours}</span>
                    )}
                    {jobLine.laborRate && (
                      <span>Rate: ${jobLine.laborRate}</span>
                    )}
                    {jobLine.totalAmount && (
                      <span>Total: ${jobLine.totalAmount}</span>
                    )}
                  </div>
                </div>

                {isEditMode && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingJobLine(jobLine)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveJobLine(jobLine.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {jobLine.parts && jobLine.parts.length > 0 && (
                <JobLinePartsDisplay 
                  parts={jobLine.parts}
                />
              )}
            </Card>
          ))
        )}
      </div>

      {editingJobLine && (
        <JobLineEditDialog
          jobLine={editingJobLine}
          open={!!editingJobLine}
          onOpenChange={() => setEditingJobLine(null)}
          onSave={handleEditJobLine}
        />
      )}

      {addingPartsToJobLine && workOrderId && (
        <AddPartsDialog
          jobLineId={addingPartsToJobLine.id}
          workOrderId={workOrderId}
          open={!!addingPartsToJobLine}
          onOpenChange={() => setAddingPartsToJobLine(null)}
          onPartsAdd={handlePartsAdded}
        />
      )}
    </div>
  );
}
