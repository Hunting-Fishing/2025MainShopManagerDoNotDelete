
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { WorkOrderJobLine, jobLineStatusMap } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { DroppableJobLinePartsSection } from '../parts/DroppableJobLinePartsSection';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { EditPartDialog } from '../parts/EditPartDialog';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  isEditMode?: boolean;
  onPartsChange?: (jobLineId: string, parts: WorkOrderPart[]) => void;
}

export function JobLineCard({ 
  jobLine, 
  onUpdate, 
  onDelete, 
  isEditMode = false,
  onPartsChange 
}: JobLineCardProps) {
  const [addPartsDialogOpen, setAddPartsDialogOpen] = useState(false);
  const [editPartDialogOpen, setEditPartDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<WorkOrderPart | null>(null);

  const handleRemovePart = (partId: string) => {
    if (jobLine.parts && onPartsChange) {
      const updatedParts = jobLine.parts.filter(part => part.id !== partId);
      onPartsChange(jobLine.id, updatedParts);
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setSelectedPart(part);
    setEditPartDialogOpen(true);
  };

  const handleSaveEditedPart = (updatedPart: WorkOrderPart) => {
    if (jobLine.parts && onPartsChange) {
      const updatedParts = jobLine.parts.map(part => 
        part.id === updatedPart.id ? updatedPart : part
      );
      onPartsChange(jobLine.id, updatedParts);
    }
  };

  const handlePartsAdded = (newParts: WorkOrderPart[]) => {
    if (onPartsChange) {
      const currentParts = jobLine.parts || [];
      const updatedParts = [...currentParts, ...newParts];
      onPartsChange(jobLine.id, updatedParts);
    }
    setAddPartsDialogOpen(false);
  };

  const statusInfo = jobLineStatusMap[jobLine.status] || { 
    label: jobLine.status, 
    classes: 'bg-gray-100 text-gray-800' 
  };

  const totalAmount = jobLine.totalAmount || 0;
  const partsTotal = (jobLine.parts || []).reduce((total, part) => 
    total + (part.customerPrice * part.quantity), 0
  );
  const grandTotal = totalAmount + partsTotal;

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{jobLine.name}</CardTitle>
                <Badge className={statusInfo.classes}>
                  {statusInfo.label}
                </Badge>
              </div>
              
              {jobLine.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {jobLine.description}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {jobLine.estimatedHours && (
                  <div>
                    <span className="font-medium text-slate-600">Hours:</span>
                    <div>{jobLine.estimatedHours}</div>
                  </div>
                )}
                {jobLine.laborRate && (
                  <div>
                    <span className="font-medium text-slate-600">Rate:</span>
                    <div>${jobLine.laborRate}/hr</div>
                  </div>
                )}
                <div>
                  <span className="font-medium text-slate-600">Labor:</span>
                  <div>${totalAmount.toFixed(2)}</div>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Total:</span>
                  <div className="font-medium">${grandTotal.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {isEditMode && (
              <div className="flex items-center gap-2">
                {onUpdate && (
                  <Button variant="ghost" size="sm" onClick={() => onUpdate(jobLine)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(jobLine.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Parts & Materials</h4>
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddPartsDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Add Parts
                </Button>
              )}
            </div>

            <DroppableJobLinePartsSection
              jobLineId={jobLine.id}
              parts={jobLine.parts || []}
              onRemovePart={handleRemovePart}
              onEditPart={handleEditPart}
              isEditMode={isEditMode}
            />

            {(jobLine.parts || []).length > 0 && (
              <div className="text-right text-sm">
                <span className="font-medium text-slate-600">Parts Total: </span>
                <span className="font-medium">${partsTotal.toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddPartsDialog
        workOrderId={jobLine.workOrderId || ''}
        jobLineId={jobLine.id}
        onPartsAdd={handlePartsAdded}
        open={addPartsDialogOpen}
        onOpenChange={setAddPartsDialogOpen}
      />

      <EditPartDialog
        part={selectedPart}
        open={editPartDialogOpen}
        onOpenChange={setEditPartDialogOpen}
        onSave={handleSaveEditedPart}
      />
    </>
  );
}
