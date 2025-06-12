
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Package } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';
import { EditJobLineDialog } from './EditJobLineDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onEdit?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void | Promise<void>;
  onPartsChange?: (newParts: any) => void;
  isEditMode?: boolean;
}

export function JobLineCard({ 
  jobLine, 
  onEdit, 
  onDelete, 
  onUpdate, 
  onPartsChange, 
  isEditMode = false 
}: JobLineCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const statusInfo = jobLineStatusMap[jobLine.status || 'pending'];

  const handleEdit = () => {
    if (onEdit) {
      onEdit(jobLine);
    } else {
      setShowEditDialog(true);
    }
  };

  const handleUpdate = (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      onUpdate(updatedJobLine);
    }
    setShowEditDialog(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(jobLine.id);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {jobLine.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={statusInfo.classes}>
              {statusInfo.label}
            </Badge>
            {isEditMode && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job Line</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this job line? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {jobLine.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {jobLine.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Hours: </span>
              <span className="font-medium">{jobLine.estimated_hours || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rate: </span>
              <span className="font-medium">${jobLine.labor_rate || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-medium">${jobLine.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
            {jobLine.parts && jobLine.parts.length > 0 && (
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{jobLine.parts.length} parts</span>
              </div>
            )}
          </div>

          {jobLine.parts && jobLine.parts.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <h5 className="text-sm font-medium mb-2">Parts:</h5>
              <div className="space-y-1">
                {jobLine.parts.map((part) => (
                  <div key={part.id} className="text-sm text-muted-foreground flex justify-between">
                    <span>{part.name} (Qty: {part.quantity})</span>
                    <span className="font-medium">${part.total_price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {jobLine.notes && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Notes: </span>
                {jobLine.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showEditDialog && (
        <EditJobLineDialog
          jobLine={jobLine}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}
