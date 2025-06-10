
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { jobLineStatusMap } from '@/types/jobLine';
import { JobLineEditDialog } from './JobLineEditDialog';
import { JobLinePartsDisplay } from './JobLinePartsDisplay';
import { AddPartsDialog } from '../parts/AddPartsDialog';

interface JobLinesGridProps {
  jobLines: WorkOrderJobLine[];
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => Promise<void>;
  onDelete?: (jobLineId: string) => Promise<void>;
  isEditMode?: boolean;
  showSummary?: boolean;
  workOrderId?: string;
}

export function JobLinesGrid({ 
  jobLines, 
  onJobLinesChange, 
  onUpdate,
  onDelete,
  isEditMode = false,
  showSummary = true,
  workOrderId
}: JobLinesGridProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
    setEditDialogOpen(true);
  };

  const handleSave = async (updatedJobLine: WorkOrderJobLine) => {
    try {
      if (onUpdate) {
        await onUpdate(updatedJobLine);
      } else if (onJobLinesChange) {
        const updatedJobLines = jobLines.map(jl => 
          jl.id === updatedJobLine.id ? updatedJobLine : jl
        );
        onJobLinesChange(updatedJobLines);
      }
      setEditDialogOpen(false);
      setEditingJobLine(null);
    } catch (error) {
      console.error('Error updating job line:', error);
    }
  };

  const handleDelete = async (jobLineId: string) => {
    try {
      if (onDelete) {
        await onDelete(jobLineId);
      } else if (onJobLinesChange) {
        const updatedJobLines = jobLines.filter(jl => jl.id !== jobLineId);
        onJobLinesChange(updatedJobLines);
      }
    } catch (error) {
      console.error('Error deleting job line:', error);
    }
  };

  const handlePartsAdded = () => {
    // Refresh callback - could be enhanced to reload specific job line parts
    console.log('Parts added, consider refreshing job lines');
  };

  if (!jobLines || jobLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No job lines added yet</p>
        {isEditMode && (
          <p className="text-sm">Click "Add Job Line" to get started</p>
        )}
      </div>
    );
  }

  // Calculate totals if showSummary is true
  const totalLabor = jobLines.reduce((sum, jobLine) => sum + (jobLine.totalAmount || 0), 0);
  const totalParts = jobLines.reduce((sum, jobLine) => {
    const partsTotal = jobLine.parts?.reduce((partSum, part) => 
      partSum + (part.customerPrice * part.quantity), 0) || 0;
    return sum + partsTotal;
  }, 0);
  const grandTotal = totalLabor + totalParts;

  return (
    <div className="space-y-4">
      {jobLines.map((jobLine) => {
        const statusInfo = jobLineStatusMap[jobLine.status] || jobLineStatusMap.pending;
        const partsTotal = jobLine.parts?.reduce((total, part) => 
          total + (part.customerPrice * part.quantity), 0) || 0;
        const totalWithParts = (jobLine.totalAmount || 0) + partsTotal;

        return (
          <Card key={jobLine.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{jobLine.name}</CardTitle>
                  <Badge className={statusInfo.classes}>
                    {statusInfo.label}
                  </Badge>
                  {jobLine.category && (
                    <Badge variant="outline" className="text-xs">
                      {jobLine.category}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {isEditMode && workOrderId && (
                    <AddPartsDialog
                      workOrderId={workOrderId}
                      jobLineId={jobLine.id}
                      onPartsAdd={handlePartsAdded}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Parts
                        </Button>
                      }
                    />
                  )}
                  {isEditMode && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(jobLine)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(jobLine.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {jobLine.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {jobLine.description}
                </p>
              )}
              
              <div className="grid grid-cols-4 gap-4 text-sm mb-3">
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
                    ${totalWithParts.toFixed(2)}
                  </span>
                </div>
              </div>

              <JobLinePartsDisplay 
                parts={jobLine.parts || []}
                isEditMode={isEditMode}
              />
            </CardContent>
          </Card>
        );
      })}

      {showSummary && (
        <Card className="bg-slate-50 border-2 border-slate-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Summary</h3>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Labor: ${totalLabor.toFixed(2)} | Parts: ${totalParts.toFixed(2)}
                </div>
                <div className="text-xl font-bold text-green-600">
                  Total: ${grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <JobLineEditDialog
        jobLine={editingJobLine}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}
