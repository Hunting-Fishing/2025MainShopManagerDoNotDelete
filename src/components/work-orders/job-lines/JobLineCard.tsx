
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';
import { WorkOrderJobLine, jobLineStatusMap } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { JobLineDialog } from './JobLineDialog';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { EditPartDialog } from '../parts/EditPartDialog';
import { useJobLines } from '@/hooks/useJobLines';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { useJobLineParts } from '@/hooks/useJobLineParts';
import { useParts } from '@/hooks/useParts';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  isEditMode?: boolean;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => Promise<void> | void;
  onDelete?: (jobLineId: string) => Promise<void> | void;
  onPartsChange?: (newParts: WorkOrderPart[]) => void;
}

export function JobLineCard({ 
  jobLine, 
  isEditMode = false,
  onUpdate,
  onDelete,
  onPartsChange
}: JobLineCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddPartsDialog, setShowAddPartsDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);
  const { removePart } = useParts();

  const handleUpdate = async (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      await onUpdate(updatedJobLine);
    }
    setShowEditDialog(false);
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(jobLine.id);
    }
  };

  const handleRemovePart = async (partId: string) => {
    const success = await removePart(partId);
    if (success && jobLine.parts && onPartsChange) {
      const updatedParts = jobLine.parts.filter(part => part.id !== partId);
      onPartsChange(updatedParts);
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPart(part);
  };

  const handlePartSaved = () => {
    setEditingPart(null);
    // Refresh parts data if needed
  };

  const handlePartsAdded = () => {
    setShowAddPartsDialog(false);
    // Refresh parts data if needed
  };

  const statusBadge = jobLineStatusMap[jobLine.status];

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{jobLine.name}</CardTitle>
              <Badge 
                variant="secondary" 
                className={statusBadge?.classes || 'bg-gray-100 text-gray-800'}
              >
                {statusBadge?.label || jobLine.status}
              </Badge>
            </div>
            {isEditMode && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobLine.description && (
            <p className="text-muted-foreground">{jobLine.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {jobLine.estimatedHours && (
              <div>
                <span className="font-medium text-slate-600">Est. Hours:</span>
                <div className="text-slate-900">{jobLine.estimatedHours}</div>
              </div>
            )}
            {jobLine.laborRate && (
              <div>
                <span className="font-medium text-slate-600">Labor Rate:</span>
                <div className="text-slate-900">${jobLine.laborRate}/hr</div>
              </div>
            )}
            {jobLine.totalAmount && (
              <div>
                <span className="font-medium text-slate-600">Total:</span>
                <div className="text-slate-900 font-medium">${jobLine.totalAmount}</div>
              </div>
            )}
            {jobLine.category && (
              <div>
                <span className="font-medium text-slate-600">Category:</span>
                <div className="text-slate-900">{jobLine.category}</div>
              </div>
            )}
          </div>

          {jobLine.notes && (
            <div className="text-sm">
              <span className="font-medium text-slate-600">Notes:</span>
              <div className="text-slate-700 mt-1">{jobLine.notes}</div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-900">Parts</h4>
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPartsDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
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
          </div>
        </CardContent>
      </Card>

      {showEditDialog && (
        <JobLineDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          jobLine={jobLine}
          onUpdate={handleUpdate}
        />
      )}

      {showAddPartsDialog && (
        <AddPartsDialog
          workOrderId={jobLine.workOrderId || ''}
          jobLineId={jobLine.id}
          onPartsAdd={handlePartsAdded}
          open={showAddPartsDialog}
          onOpenChange={setShowAddPartsDialog}
        />
      )}

      {editingPart && (
        <EditPartDialog
          open={true}
          onOpenChange={() => setEditingPart(null)}
          part={editingPart}
          onSave={handlePartSaved}
        />
      )}
    </>
  );
}
