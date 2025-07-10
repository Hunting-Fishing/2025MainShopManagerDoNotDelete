
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2 } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';
import { SimpleJobLineEditDialog } from './SimpleJobLineEditDialog';
import { generateTempJobLineId } from '@/services/jobLineParserEnhanced';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts?: WorkOrderPart[];
  onUpdate?: ((jobLine: WorkOrderJobLine) => void) | (() => Promise<void>); // Support both patterns
  onDelete?: (jobLineId: string) => void;
  onEdit?: (jobLine: WorkOrderJobLine) => void;
  onAddJobLine?: (jobLine: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>) => void;
  workOrderId?: string;
  isEditMode: boolean;
}

export function CompactJobLinesTable({
  jobLines,
  allParts = [],
  onUpdate,
  onDelete,
  onEdit,
  onAddJobLine,
  workOrderId,
  isEditMode
}: CompactJobLinesTableProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addItemType, setAddItemType] = useState<string>('add-item');

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

  const handleAddItemTypeSelect = (type: string) => {
    if (type === 'add-item' || !onAddJobLine || !workOrderId) return;
    
    // Create default job line based on type
    const defaultJobLine: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'> = {
      work_order_id: workOrderId,
      name: getDefaultNameForType(type as 'labor' | 'parts' | 'sublet' | 'note'),
      category: type === 'labor' ? 'Labor' : type === 'parts' ? 'Parts' : type === 'sublet' ? 'Sublet' : 'Note',
      description: '',
      estimated_hours: type === 'labor' ? 1 : undefined,
      labor_rate: type === 'labor' ? 85 : undefined,
      total_amount: type === 'labor' ? 85 : type === 'note' ? 0 : undefined,
      status: 'pending',
      display_order: jobLines.length + 1,
      notes: ''
    };

    // Add the job line
    onAddJobLine(defaultJobLine);
    
    // Reset dropdown
    setAddItemType('add-item');
  };

  const getDefaultNameForType = (type: 'labor' | 'parts' | 'sublet' | 'note'): string => {
    switch (type) {
      case 'labor':
        return 'Labor Service';
      case 'parts':
        return 'Part/Material';
      case 'sublet':
        return 'Subcontractor/Misc';
      case 'note':
        return 'Note';
      default:
        return 'Item';
    }
  };

  if (jobLines.length === 0 && !isEditMode) {
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
            <TableHead>Type</TableHead>
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
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {jobLine.category || 'Labor'}
                  </Badge>
                </TableCell>
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
          
          {/* Add Item Row - Only show when in edit mode and onAddJobLine is provided */}
          {isEditMode && onAddJobLine && (
            <TableRow className="bg-muted/30 hover:bg-muted/50">
              <TableCell>
                <Select value={addItemType} onValueChange={handleAddItemTypeSelect}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add-item">Add Item</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="parts">Parts</SelectItem>
                    <SelectItem value="sublet">Sublet/Misc</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {addItemType === 'add-item' ? 'Select type to add new item' : ''}
              </TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              <TableCell className="text-muted-foreground"></TableCell>
              {isEditMode && <TableCell></TableCell>}
            </TableRow>
          )}
          
          {/* Show "no items" message only when no job lines and not in edit mode */}
          {jobLines.length === 0 && !isEditMode && (
            <TableRow>
              <TableCell colSpan={isEditMode ? 8 : 7} className="text-center py-4 text-muted-foreground">
                No job lines added yet
              </TableCell>
            </TableRow>
          )}
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
