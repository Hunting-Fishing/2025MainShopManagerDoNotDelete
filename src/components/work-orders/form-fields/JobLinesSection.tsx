
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineEditDialog } from '../job-lines/JobLineEditDialog';
import { Badge } from '@/components/ui/badge';
import { jobLineStatusMap } from '@/types/jobLine';

interface JobLinesSectionProps {
  workOrderId: string;
  description?: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: () => Promise<void>;
  isEditMode: boolean;
  shopId?: string;
}

export function JobLinesSection({
  workOrderId,
  description,
  jobLines,
  onJobLinesChange,
  isEditMode,
  shopId
}: JobLinesSectionProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddJobLine = () => {
    setEditingJobLine(null);
    setIsDialogOpen(true);
  };

  const handleEditJobLine = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
    setIsDialogOpen(true);
  };

  const handleDeleteJobLine = async (jobLineId: string) => {
    if (confirm('Are you sure you want to delete this job line?')) {
      try {
        // TODO: Implement delete job line API call
        console.log('Deleting job line:', jobLineId);
        await onJobLinesChange();
      } catch (error) {
        console.error('Error deleting job line:', error);
      }
    }
  };

  const handleDialogSave = async (jobLines: WorkOrderJobLine[]) => {
    try {
      // The dialog handles the save operation
      // We just need to refresh the data
      await onJobLinesChange();
      setIsDialogOpen(false);
      setEditingJobLine(null);
    } catch (error) {
      console.error('Error saving job line:', error);
    }
  };

  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Labor & Services</CardTitle>
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddJobLine}
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
          <div className="text-center py-8 text-gray-500">
            <p>No labor lines added yet.</p>
            {isEditMode && (
              <Button
                variant="outline"
                onClick={handleAddJobLine}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Labor Line
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobLines.map((jobLine) => (
              <div
                key={jobLine.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{jobLine.name}</h4>
                      {jobLine.status && (
                        <Badge variant="outline" className={jobLineStatusMap[jobLine.status]?.classes}>
                          {jobLineStatusMap[jobLine.status]?.label || jobLine.status}
                        </Badge>
                      )}
                    </div>
                    
                    {jobLine.description && (
                      <p className="text-sm text-gray-600 mb-2">{jobLine.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Hours:</span> {jobLine.estimated_hours || 0}
                      </div>
                      <div>
                        <span className="text-gray-500">Rate:</span> ${jobLine.labor_rate || 0}/hr
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span> ${jobLine.total_amount || 0}
                      </div>
                    </div>
                    
                    {jobLine.category && (
                      <div className="mt-2 text-sm text-gray-500">
                        Category: {jobLine.category}
                        {jobLine.subcategory && ` → ${jobLine.subcategory}`}
                      </div>
                    )}
                  </div>
                  
                  {isEditMode && (
                    <div className="flex items-center gap-2 ml-4">
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
                        onClick={() => handleDeleteJobLine(jobLine.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Labor Cost:</span>
                <span>${totalLaborCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <JobLineEditDialog
          jobLine={editingJobLine}
          mode="add-manual"
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleDialogSave}
        />
      </CardContent>
    </Card>
  );
}
