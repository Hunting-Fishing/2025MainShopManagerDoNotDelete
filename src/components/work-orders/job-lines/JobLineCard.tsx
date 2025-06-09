
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { jobLineStatusMap } from '@/types/jobLine';
import { EditJobLineDialog } from './EditJobLineDialog';
import { JobLinePartsDisplay } from '../parts/JobLinePartsDisplay';
import { AddPartsDialog } from '../parts/AddPartsDialog';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (jobLine: WorkOrderJobLine) => void;
  onDelete: (jobLineId: string) => void;
  onAddParts?: (jobLineId: string, parts: WorkOrderPartFormValues[]) => void;
  onRemovePart?: (partId: string) => void;
  isEditMode?: boolean;
}

export function JobLineCard({ 
  jobLine, 
  onUpdate, 
  onDelete,
  onAddParts,
  onRemovePart,
  isEditMode = false 
}: JobLineCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const statusInfo = jobLineStatusMap[jobLine.status] || jobLineStatusMap.pending;

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedJobLine: WorkOrderJobLine) => {
    onUpdate(updatedJobLine);
  };

  const handleAddParts = (parts: WorkOrderPartFormValues[]) => {
    if (onAddParts) {
      onAddParts(jobLine.id, parts);
    }
  };

  // Calculate total including parts
  const partsTotal = jobLine.parts?.reduce((total, part) => 
    total + (part.customerPrice * part.quantity), 0) || 0;
  const totalWithParts = (jobLine.totalAmount || 0) + partsTotal;

  return (
    <>
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
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
                    ${totalWithParts.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Parts Display */}
              <JobLinePartsDisplay 
                parts={jobLine.parts || []}
                onRemovePart={onRemovePart}
                isEditMode={isEditMode}
              />
            </div>
            
            <div className="flex items-center gap-1 ml-4">
              {isEditMode && onAddParts && (
                <AddPartsDialog
                  workOrderId={jobLine.workOrderId || ''}
                  jobLineId={jobLine.id}
                  onPartsAdd={handleAddParts}
                />
              )}
              {isEditMode && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(jobLine.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditJobLineDialog
        jobLine={jobLine}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
      />
    </>
  );
}
