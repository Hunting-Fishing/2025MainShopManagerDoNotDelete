
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkOrderJobLine } from '@/types/jobLine';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';
import { JobLineCard } from '../job-lines/JobLineCard';
import { AddJobLineDialog } from '../job-lines/AddJobLineDialog';
import { Plus, Wrench } from 'lucide-react';

interface WorkOrderLaborSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
}

export function WorkOrderLaborSection({ 
  workOrderId, 
  jobLines, 
  onJobLinesChange, 
  isEditMode = false 
}: WorkOrderLaborSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddJobLines = (newJobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => {
    const jobLinesWithIds = newJobLines.map(jobLine => ({
      ...jobLine,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    onJobLinesChange([...jobLines, ...jobLinesWithIds]);
  };

  const handleUpdateJobLine = (updatedJobLine: WorkOrderJobLine) => {
    const updatedJobLines = jobLines.map(jobLine =>
      jobLine.id === updatedJobLine.id ? updatedJobLine : jobLine
    );
    onJobLinesChange(updatedJobLines);
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    const updatedJobLines = jobLines.filter(jobLine => jobLine.id !== jobLineId);
    onJobLinesChange(updatedJobLines);
  };

  const totalLaborHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Labor Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Job Lines</p>
                <p className="text-2xl font-bold">{jobLines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <span className="text-white text-xs">H</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalLaborHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <span className="text-white text-xs">$</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${totalLaborCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Lines Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Labor & Job Lines ({jobLines.length})
            </CardTitle>
            {isEditMode && (
              <AddJobLineDialog 
                workOrderId={workOrderId}
                onJobLineAdd={handleAddJobLines}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {jobLines.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Labor Lines</h3>
              <p className="text-muted-foreground mb-4">
                No labor or job lines have been added to this work order yet.
              </p>
              {isEditMode && (
                <AddJobLineDialog 
                  workOrderId={workOrderId}
                  onJobLineAdd={handleAddJobLines}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jobLines.map((jobLine) => (
                <JobLineCard
                  key={jobLine.id}
                  jobLine={jobLine}
                  onUpdate={handleUpdateJobLine}
                  onDelete={isEditMode ? handleDeleteJobLine : undefined}
                  isEditMode={isEditMode}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
