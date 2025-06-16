
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  onReorderJobLines?: (jobLines: WorkOrderJobLine[]) => void;
  onReorderParts?: (parts: WorkOrderPart[]) => void;
  isEditMode: boolean;
  showType: 'overview' | 'parts' | 'labor';
}

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function SortableRow({ id, children, disabled }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      {children}
    </TableRow>
  );
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  onReorderJobLines,
  onReorderParts,
  isEditMode,
  showType
}: UnifiedItemsTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Handle job line reordering
    if (active.id.startsWith('job-') && over.id.startsWith('job-')) {
      const oldIndex = jobLines.findIndex(line => `job-${line.id}` === active.id);
      const newIndex = jobLines.findIndex(line => `job-${line.id}` === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newJobLines = arrayMove(jobLines, oldIndex, newIndex);
        onReorderJobLines?.(newJobLines);
      }
    }

    // Handle parts reordering
    if (active.id.startsWith('part-') && over.id.startsWith('part-')) {
      const oldIndex = allParts.findIndex(part => `part-${part.id}` === active.id);
      const newIndex = allParts.findIndex(part => `part-${part.id}` === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newParts = arrayMove(allParts, oldIndex, newIndex);
        onReorderParts?.(newParts);
      }
    }
  };

  const renderJobLines = () => {
    if (showType === 'parts') return null;

    return jobLines.map((jobLine) => (
      <SortableRow key={`job-${jobLine.id}`} id={`job-${jobLine.id}`} disabled={!isEditMode}>
        {isEditMode && (
          <TableCell className="w-8">
            <div 
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              {...(isEditMode && {
                'data-dnd-handle': true
              })}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </TableCell>
        )}
        <TableCell className="font-medium">{jobLine.name}</TableCell>
        <TableCell>{jobLine.category || 'Labor'}</TableCell>
        <TableCell>{jobLine.estimated_hours || 0} hrs</TableCell>
        <TableCell>${jobLine.labor_rate || 0}/hr</TableCell>
        <TableCell className="font-medium">${jobLine.total_amount || 0}</TableCell>
        <TableCell>
          {jobLine.status && (
            <Badge variant="outline">{jobLine.status}</Badge>
          )}
        </TableCell>
        {isEditMode && (
          <TableCell>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onJobLineUpdate?.(jobLine)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onJobLineDelete?.(jobLine.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        )}
      </SortableRow>
    ));
  };

  const renderParts = () => {
    if (showType === 'labor') return null;

    return allParts.map((part) => (
      <SortableRow key={`part-${part.id}`} id={`part-${part.id}`} disabled={!isEditMode}>
        {isEditMode && (
          <TableCell className="w-8">
            <div 
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              {...(isEditMode && {
                'data-dnd-handle': true
              })}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </TableCell>
        )}
        <TableCell className="font-medium">{part.name}</TableCell>
        <TableCell>{part.part_number}</TableCell>
        <TableCell>{part.quantity}</TableCell>
        <TableCell>${part.unit_price}</TableCell>
        <TableCell className="font-medium">${part.total_price}</TableCell>
        <TableCell>
          {part.status && (
            <Badge variant="outline">{part.status}</Badge>
          )}
        </TableCell>
        {isEditMode && (
          <TableCell>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPartUpdate?.(part)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPartDelete?.(part.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        )}
      </SortableRow>
    ));
  };

  const allItems = [
    ...jobLines.map(line => ({ ...line, type: 'job', sortId: `job-${line.id}` })),
    ...allParts.map(part => ({ ...part, type: 'part', sortId: `part-${part.id}` }))
  ];

  if (allItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {showType === 'labor' && 'No job lines added yet'}
        {showType === 'parts' && 'No parts added yet'}
        {showType === 'overview' && 'No items added yet'}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={allItems.map(item => item.sortId)}
        strategy={verticalListSortingStrategy}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {isEditMode && <TableHead className="w-8"></TableHead>}
              <TableHead>Item</TableHead>
              <TableHead>Category/Part #</TableHead>
              <TableHead>Qty/Hours</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              {isEditMode && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderJobLines()}
            {renderParts()}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );
}
