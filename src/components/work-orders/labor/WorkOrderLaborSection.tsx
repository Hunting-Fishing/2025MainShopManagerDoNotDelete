
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wrench } from 'lucide-react';
import { ServiceBasedJobLineForm } from '../job-lines/ServiceBasedJobLineForm';

interface WorkOrderLaborSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function WorkOrderLaborSection({
  workOrderId,
  jobLines,
  onJobLinesChange,
  isEditMode
}: WorkOrderLaborSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleJobLineAdd = (newJobLines: Omit<WorkOrderJobLine, "id" | "created_at" | "updated_at">[]) => {
    const jobLinesWithIds = newJobLines.map(jobLine => ({
      ...jobLine,
      id: `temp-${Date.now()}-${Math.random()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const updatedJobLines = [...jobLines, ...jobLinesWithIds];
    onJobLinesChange(updatedJobLines);
    setShowAddDialog(false);
  };

  const handleCancel = () => {
    setShowAddDialog(false);
  };

  if (showAddDialog) {
    return (
      <ServiceBasedJobLineForm
        workOrderId={workOrderId}
        onSubmit={handleJobLineAdd}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Labor & Job Lines ({jobLines.length})
          </CardTitle>
          {isEditMode && (
            <Button 
              onClick={() => setShowAddDialog(true)} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Labor
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {jobLines.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No labor entries added yet.</p>
            {isEditMode && (
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add First Labor Entry
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobLines.map((jobLine) => (
              <div key={jobLine.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{jobLine.name}</h4>
                    <p className="text-sm text-muted-foreground">{jobLine.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span>Hours: {jobLine.estimated_hours}</span>
                      <span>Rate: ${jobLine.labor_rate}</span>
                      <span>Total: ${jobLine.total_amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
