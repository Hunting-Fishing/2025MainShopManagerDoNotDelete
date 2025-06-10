
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { JobLineEditDialog } from './JobLineEditDialog';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { JobLinePartsDisplay } from './JobLinePartsDisplay';
import { Badge } from '@/components/ui/badge';
import { calculateTotalJobLineAmount, calculateTotalEstimatedHours, calculateTotalPartsCost } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { WorkOrderJobLine } from '@/types/jobLine';
import { jobLineStatusMap } from '@/types/jobLine';

interface JobLinesGridProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
}

export function JobLinesGrid({ 
  workOrderId, 
  jobLines, 
  onJobLinesChange, 
  isEditMode = false 
}: JobLinesGridProps) {
  const [editingJobLine, setEditingJobLine] = React.useState<WorkOrderJobLine | null>(null);
  const [addingPartsToJobLine, setAddingPartsToJobLine] = React.useState<string | null>(null);
  const [jobLinesWithParts, setJobLinesWithParts] = React.useState<WorkOrderJobLine[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    loadJobLinesWithParts();
  }, [jobLines]);

  const loadJobLinesWithParts = () => {
    const updatedJobLines = jobLines.map((jobLine) => ({
      ...jobLine,
      totalAmount: calculateTotalJobLineAmount(jobLine)
    }));
    setJobLinesWithParts(updatedJobLines);
  };

  const handleRemoveJobLine = (jobLineId: string) => {
    if (!onJobLinesChange) {
      console.error('onJobLinesChange is not provided to JobLinesGrid');
      toast({
        title: "Error",
        description: "Cannot remove job line - missing callback function",
        variant: "destructive"
      });
      return;
    }
    
    const updatedJobLines = jobLines.filter((jl) => jl.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  const handlePartsAdded = () => {
    loadJobLinesWithParts();
    setAddingPartsToJobLine(null);
  };

  const handleEditJobLine = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
  };

  const handleSaveJobLine = (updatedJobLine: WorkOrderJobLine) => {
    if (!onJobLinesChange) {
      console.error('onJobLinesChange is not provided to JobLinesGrid');
      toast({
        title: "Error", 
        description: "Cannot save job line changes - missing callback function",
        variant: "destructive"
      });
      return;
    }

    const updatedJobLines = jobLines.map((jl) => 
      jl.id === updatedJobLine.id ? updatedJobLine : jl
    );
    onJobLinesChange(updatedJobLines);
    setEditingJobLine(null);
  };

  const totalEstimatedHours = calculateTotalEstimatedHours(jobLines);
  const totalPartsCost = calculateTotalPartsCost(jobLines);
  const totalJobLinesAmount = jobLines.reduce((acc, jobLine) => acc + (jobLine.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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

      {/* Job Lines List */}
      <div className="space-y-4">
        {jobLinesWithParts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No job lines added yet
          </div>
        ) : (
          jobLinesWithParts.map((jobLine) => {
            const statusInfo = jobLineStatusMap[jobLine.status] || jobLineStatusMap.pending;
            
            return (
              <Card key={jobLine.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{jobLine.name}</h4>
                      <Badge className={statusInfo.classes}>
                        {statusInfo.label}
                      </Badge>
                      {jobLine.category && (
                        <Badge variant="outline" className="text-xs">
                          {jobLine.category}
                        </Badge>
                      )}
                    </div>
                    
                    {jobLine.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {jobLine.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Hours:</span>
                        <span className="ml-1 font-medium">
                          {jobLine.estimatedHours?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate:</span>
                        <span className="ml-1 font-medium">
                          ${jobLine.laborRate?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Labor:</span>
                        <span className="ml-1 font-medium">
                          ${jobLine.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-1 font-medium text-green-600">
                          ${(jobLine.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Parts Display */}
                    <JobLinePartsDisplay 
                      parts={jobLine.parts || []}
                      isEditMode={isEditMode}
                    />
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    {isEditMode && onJobLinesChange && (
                      <>
                        <AddPartsDialog
                          workOrderId={workOrderId}
                          jobLineId={jobLine.id}
                          onPartsAdd={handlePartsAdded}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditJobLine(jobLine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveJobLine(jobLine.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      {editingJobLine && (
        <JobLineEditDialog
          jobLine={editingJobLine}
          open={!!editingJobLine}
          onOpenChange={(open) => !open && setEditingJobLine(null)}
          onSave={handleSaveJobLine}
        />
      )}
    </div>
  );
}
