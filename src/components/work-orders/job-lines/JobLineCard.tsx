
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { WorkOrderJobLine, jobLineStatusMap } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { EditPartDialog } from '../parts/EditPartDialog';
import { JobLineDialog } from './JobLineDialog';
import { useJobLines } from '@/hooks/useJobLines';
import { toast } from 'sonner';
import { useParts } from '@/hooks/useParts';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  isEditMode?: boolean;
  onPartsChange: (newParts: WorkOrderPart[]) => void;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => Promise<void> | void;
  onDelete?: (jobLineId: string) => Promise<void> | void;
}

export function JobLineCard({ 
  jobLine, 
  isEditMode = false, 
  onPartsChange,
  onUpdate,
  onDelete
}: JobLineCardProps) {
  const [isAddPartsOpen, setIsAddPartsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);
  const { removePart } = useParts();

  const handleRemovePart = async (partId: string) => {
    const success = await removePart(partId);
    if (success) {
      const updatedParts = (jobLine.parts || []).filter(p => p.id !== partId);
      onPartsChange(updatedParts);
      toast.success('Part removed successfully');
    } else {
      toast.error('Failed to remove part');
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPart(part);
  };

  const handlePartUpdated = () => {
    setEditingPart(null);
    // Refresh parts list - you might want to implement this
    toast.success('Part updated successfully');
  };

  const handlePartsAdded = (newParts: WorkOrderPart[]) => {
    const updatedParts = [...(jobLine.parts || []), ...newParts];
    onPartsChange(updatedParts);
    setIsAddPartsOpen(false);
    toast.success(`${newParts.length} part(s) added successfully`);
  };

  const handleUpdateJobLine = async (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      await onUpdate(updatedJobLine);
    }
    setIsEditDialogOpen(false);
  };

  const handleDeleteJobLine = async () => {
    if (onDelete && window.confirm('Are you sure you want to delete this job line?')) {
      await onDelete(jobLine.id);
    }
  };

  // Calculate totals
  const totalParts = jobLine.parts?.length || 0;
  const totalPartsValue = jobLine.parts?.reduce((sum, part) => 
    sum + (part.customerPrice * part.quantity), 0
  ) || 0;

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">{jobLine.name}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className={jobLineStatusMap[jobLine.status]?.classes || 'bg-gray-100 text-gray-800'}
                >
                  {jobLineStatusMap[jobLine.status]?.label || jobLine.status}
                </Badge>
              </div>
              
              {jobLine.description && (
                <p className="text-sm text-muted-foreground">{jobLine.description}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-slate-600">
                {jobLine.estimatedHours && (
                  <span>Est. Hours: {jobLine.estimatedHours}</span>
                )}
                {jobLine.laborRate && (
                  <span>Labor Rate: ${jobLine.laborRate}/hr</span>
                )}
                <span>Parts: {totalParts}</span>
                <span className="font-medium">
                  Parts Value: ${totalPartsValue.toFixed(2)}
                </span>
              </div>
            </div>

            {isEditMode && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteJobLine}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900">Parts & Components</h4>
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddPartsOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Parts
              </Button>
            )}
          </div>

          <DroppableJobLinePartsSection
            jobLineId={jobLine.id}
            parts={jobLine.parts || []}
            onRemovePart={isEditMode ? handleRemovePart : undefined}
            onEditPart={isEditMode ? handleEditPart : undefined}
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPartsDialog
        open={isAddPartsOpen}
        onOpenChange={setIsAddPartsOpen}
        workOrderId={jobLine.workOrderId || ''}
        jobLineId={jobLine.id}
        onPartsAdd={handlePartsAdded}
      />

      {editingPart && (
        <EditPartDialog
          open={true}
          onOpenChange={() => setEditingPart(null)}
          part={editingPart}
          onSave={handlePartUpdated}
          onClose={() => setEditingPart(null)}
        />
      )}

      <JobLineDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        jobLine={jobLine}
        onUpdate={handleUpdateJobLine}
      />
    </>
  );
}
