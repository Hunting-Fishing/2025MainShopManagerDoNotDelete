
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Wrench, Package, Settings, FileText, GripVertical } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';
import { SimpleJobLineEditDialog } from './SimpleJobLineEditDialog';
import { DetailFormButton } from './DetailFormButton';
import { generateTempJobLineId } from '@/services/jobLineParserEnhanced';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts?: WorkOrderPart[];
  onUpdate?: ((jobLine: WorkOrderJobLine) => void) | (() => Promise<void>); // Support both patterns
  onDelete?: (jobLineId: string) => void;
  onEdit?: (jobLine: WorkOrderJobLine) => void;
  onAddJobLine?: (jobLine: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>) => void;
  onAddPart?: (partData: WorkOrderPartFormValues) => Promise<void>;
  onReorder?: (reorderedJobLines: WorkOrderJobLine[]) => void;
  workOrderId?: string;
  isEditMode: boolean;
}

interface SortableJobLineRowProps {
  jobLine: WorkOrderJobLine;
  isEditMode: boolean;
  onUpdate?: ((jobLine: WorkOrderJobLine) => void) | (() => Promise<void>);
  onDelete?: (jobLineId: string) => void;
  onEdit?: (jobLine: WorkOrderJobLine) => void;
  onAddPart?: (partData: WorkOrderPartFormValues) => Promise<void>;
  getIconForCategory: (category?: string) => React.ReactNode;
  handleEditClick: (jobLine: WorkOrderJobLine) => void;
  handleCompletionToggle: (jobLine: WorkOrderJobLine, completed: boolean) => void;
}

function SortableJobLineRow({
  jobLine,
  isEditMode,
  onUpdate,
  onDelete,
  onAddPart,
  getIconForCategory,
  handleEditClick,
  handleCompletionToggle
}: SortableJobLineRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: jobLine.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusInfo = jobLineStatusMap[jobLine.status || 'pending'];

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? 'relative z-50' : ''}>
      {/* Drag Handle Column */}
      {isEditMode && (
        <TableCell className="w-8 p-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </TableCell>
      )}
      
      {/* Type Column */}
      <TableCell>
        <div className="flex items-center gap-2">
          {getIconForCategory(jobLine.category)}
          <Badge variant="outline" className="text-xs">
            {jobLine.category || 'Labor'}
          </Badge>
        </div>
      </TableCell>
      
      {/* Details Column */}
      {isEditMode && (
        <TableCell>
          <DetailFormButton 
            jobLine={jobLine} 
            onUpdate={(updatedJobLine) => {
              if (onUpdate) {
                if (onUpdate.length === 0) {
                  (onUpdate as () => Promise<void>)();
                } else {
                  (onUpdate as (jobLine: WorkOrderJobLine) => void)(updatedJobLine);
                }
              }
            }}
            onAddPart={onAddPart}
          />
        </TableCell>
      )}
      
      {/* Name, Description, Hours, Rate, Total, Status Columns */}
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
      
      {/* Complete Column */}
      {isEditMode && (
        <TableCell>
          <div className="flex items-center justify-center">
            <Checkbox
              checked={jobLine.is_work_completed || false}
              onCheckedChange={(checked) => 
                handleCompletionToggle(jobLine, checked as boolean)
              }
              title={jobLine.is_work_completed ? 
                `Completed ${jobLine.completion_date ? new Date(jobLine.completion_date).toLocaleDateString() : ''}` : 
                'Mark as completed'
              }
            />
          </div>
        </TableCell>
      )}
      
      {/* Actions Column */}
      {isEditMode && (
        <TableCell>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(jobLine)}
              title="Edit job line"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(jobLine.id)}
                title="Delete job line"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

export function CompactJobLinesTable({
  jobLines,
  allParts = [],
  onUpdate,
  onDelete,
  onEdit,
  onAddJobLine,
  onAddPart,
  onReorder,
  workOrderId,
  isEditMode
}: CompactJobLinesTableProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addItemType, setAddItemType] = useState<string>('add-item');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleCompletionToggle = (jobLine: WorkOrderJobLine, completed: boolean) => {
    if (!onUpdate) return;

    const updatedJobLine: WorkOrderJobLine = {
      ...jobLine,
      is_work_completed: completed,
      completion_date: completed ? new Date().toISOString() : undefined,
      completed_by: completed ? 'Current User' : undefined, // In real app, get from auth
      updated_at: new Date().toISOString()
    };

    if (onUpdate.length === 0) {
      (onUpdate as () => Promise<void>)();
    } else {
      (onUpdate as (jobLine: WorkOrderJobLine) => void)(updatedJobLine);
    }
  };

  const getIconForCategory = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'labor':
        return <Wrench className="h-3 w-3" />;
      case 'parts':
        return <Package className="h-3 w-3" />;
      case 'sublet':
        return <Settings className="h-3 w-3" />;
      case 'note':
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = jobLines.findIndex((item) => item.id === active.id);
      const newIndex = jobLines.findIndex((item) => item.id === over?.id);
      
      const reorderedJobLines = arrayMove(jobLines, oldIndex, newIndex).map((jobLine, index) => ({
        ...jobLine,
        display_order: index + 1
      }));
      
      // Call the reorder callback if provided
      if (onReorder) {
        onReorder(reorderedJobLines);
      }
    }
  };

  if (jobLines.length === 0 && !isEditMode) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>No job lines added yet</p>
      </div>
    );
  }

  const totalColumns = isEditMode ? 11 : 8; // Drag + Type + Details + Name + Desc + Hours + Rate + Total + Status + Complete + Actions

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {isEditMode && <TableHead className="w-8"></TableHead>} {/* Drag Handle */}
              <TableHead>Type</TableHead>
              {isEditMode && <TableHead className="w-16">Details</TableHead>}
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              {isEditMode && <TableHead className="w-20">Complete</TableHead>}
              {isEditMode && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext items={jobLines.map(jl => jl.id)} strategy={verticalListSortingStrategy}>
              {jobLines.map((jobLine) => (
                <SortableJobLineRow
                  key={jobLine.id}
                  jobLine={jobLine}
                  isEditMode={isEditMode}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onAddPart={onAddPart}
                  getIconForCategory={getIconForCategory}
                  handleEditClick={handleEditClick}
                  handleCompletionToggle={handleCompletionToggle}
                />
              ))}
            </SortableContext>
            
            {/* Add Item Row - Only show when in edit mode and onAddJobLine is provided */}
            {isEditMode && onAddJobLine && (
              <TableRow className="bg-muted/30 hover:bg-muted/50">
                {/* Drag Handle Column (empty for add row) */}
                <TableCell className="w-8"></TableCell>
                
                {/* Type Column */}
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
                
                {/* Details column for add item row */}
                <TableCell className="text-muted-foreground"></TableCell>
                <TableCell className="text-muted-foreground">
                  {addItemType === 'add-item' ? 'Select type to add new item' : ''}
                </TableCell>
                <TableCell className="text-muted-foreground"></TableCell>
                <TableCell className="text-muted-foreground"></TableCell>
                <TableCell className="text-muted-foreground"></TableCell>
                <TableCell className="text-muted-foreground"></TableCell>
                <TableCell className="text-muted-foreground"></TableCell>
                {/* Complete column for add item row */}
                <TableCell className="text-muted-foreground"></TableCell>
                {/* Actions column for add item row */}
                <TableCell></TableCell>
              </TableRow>
            )}
            
            {/* Show "no items" message only when no job lines and not in edit mode */}
            {jobLines.length === 0 && !isEditMode && (
              <TableRow>
                <TableCell colSpan={totalColumns} className="text-center py-4 text-muted-foreground">
                  No job lines added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DndContext>

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
