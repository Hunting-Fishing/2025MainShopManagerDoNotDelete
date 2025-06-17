
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Plus } from 'lucide-react';
import { EnhancedJobLineItem } from './EnhancedJobLineItem';
import { AddJobLineDialog } from './AddJobLineDialog';

interface WorkOrderJobLinesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function WorkOrderJobLinesSection({
  workOrderId,
  jobLines,
  onJobLinesChange,
  isEditMode
}: WorkOrderJobLinesSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleJobLineUpdate = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(jl => 
      jl.id === updatedJobLine.id ? updatedJobLine : jl
    );
    onJobLinesChange(updatedJobLines);
  };

  const handleJobLineAdd = (newJobLines: WorkOrderJobLine[]) => {
    const updatedJobLines = [...jobLines, ...newJobLines];
    onJobLinesChange(updatedJobLines);
    setShowAddDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Job Lines ({jobLines.length})
            </CardTitle>
            {isEditMode && (
              <Button 
                onClick={() => setShowAddDialog(true)} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Job Line
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {jobLines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No job lines added yet.</p>
              {isEditMode && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Job Line
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jobLines.map((jobLine) => (
                <EnhancedJobLineItem
                  key={jobLine.id}
                  jobLine={jobLine}
                  onUpdate={handleJobLineUpdate}
                  isEditMode={isEditMode}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddJobLineDialog
        workOrderId={workOrderId}
        onJobLineAdd={handleJobLineAdd}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
