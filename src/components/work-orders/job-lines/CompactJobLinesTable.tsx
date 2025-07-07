
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';
import { SimpleJobLineEditDialog } from './SimpleJobLineEditDialog';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts?: WorkOrderPart[];
  onUpdate?: ((jobLine: WorkOrderJobLine) => void) | (() => Promise<void>); // Support both patterns
  onDelete?: (jobLineId: string) => void;
  onEdit?: (jobLine: WorkOrderJobLine) => void;
  isEditMode: boolean;
}

export function CompactJobLinesTable({
  jobLines,
  allParts = [],
  onUpdate,
  onDelete,
  onEdit,
  isEditMode
}: CompactJobLinesTableProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = (jobLine: WorkOrderJobLine) => {
    if (onEdit) {
      onEdit(jobLine);
    } else {
      setEditingJobLine(jobLine);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveJobLine = async (updatedJobLine: WorkOrderJobLine) => {
    if (onUpdate) {
      // Support both callback patterns
      if (onUpdate.length === 0) {
        // No parameters - refresh function
        await (onUpdate as () => Promise<void>)();
      } else {
        // Has parameters - update function
        (onUpdate as (jobLine: WorkOrderJobLine) => void)(updatedJobLine);
      }
    }
    setIsEditDialogOpen(false);
    setEditingJobLine(null);
  };

  if (jobLines.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>No job lines added yet</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            {isEditMode && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobLines.map((jobLine) => {
            const statusInfo = jobLineStatusMap[jobLine.status || 'pending'];
            return (
              <TableRow key={jobLine.id}>
                <TableCell className="font-medium">{jobLine.name}</TableCell>
                <TableCell className="max-w-xs truncate">{jobLine.description}</TableCell>
                <TableCell>{jobLine.estimated_hours || 0}</TableCell>
                <TableCell>${jobLine.labor_rate || 0}</TableCell>
                <TableCell>${jobLine.total_amount || 0}</TableCell>
                <TableCell>
                  <Badge className={statusInfo.classes}>
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                {isEditMode && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(jobLine)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(jobLine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {!onEdit && editingJobLine && (
        <SimpleJobLineEditDialog
          jobLine={editingJobLine}
          workOrderId={editingJobLine.work_order_id}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveJobLine}
        />
      )}
    </>
  );
}
