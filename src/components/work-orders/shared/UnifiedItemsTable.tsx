
import React from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { StatusSelector } from './StatusSelector';
import { StatusBadge } from './StatusBadge';
import { GripVertical, Trash2, Package } from 'lucide-react';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  onReorderJobLines?: (reorderedJobLines: WorkOrderJobLine[]) => void;
  onReorderParts?: (reorderedParts: WorkOrderPart[]) => void;
  isEditMode: boolean;
  showType: 'overview' | 'labor' | 'parts';
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
  } = useSortable({ id, disabled });

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle job line reordering
    const activeJobLineIndex = jobLines.findIndex(item => item.id === activeId);
    const overJobLineIndex = jobLines.findIndex(item => item.id === overId);

    if (activeJobLineIndex !== -1 && overJobLineIndex !== -1) {
      const reorderedJobLines = arrayMove(jobLines, activeJobLineIndex, overJobLineIndex);
      onReorderJobLines?.(reorderedJobLines);
      return;
    }

    // Handle parts reordering
    const activePartIndex = allParts.findIndex(item => item.id === activeId);
    const overPartIndex = allParts.findIndex(item => item.id === overId);

    if (activePartIndex !== -1 && overPartIndex !== -1) {
      const reorderedParts = arrayMove(allParts, activePartIndex, overPartIndex);
      onReorderParts?.(reorderedParts);
      return;
    }
  };

  const handleJobLineStatusChange = (jobLineId: string, newStatus: string) => {
    const jobLine = jobLines.find(jl => jl.id === jobLineId);
    if (jobLine && onJobLineUpdate) {
      onJobLineUpdate({ ...jobLine, status: newStatus });
    }
  };

  const handlePartStatusChange = (partId: string, newStatus: string) => {
    const part = allParts.find(p => p.id === partId);
    if (part && onPartUpdate) {
      onPartUpdate({ ...part, status: newStatus });
    }
  };

  const handleJobLineFieldChange = (jobLineId: string, field: string, value: any) => {
    const jobLine = jobLines.find(jl => jl.id === jobLineId);
    if (jobLine && onJobLineUpdate) {
      onJobLineUpdate({ ...jobLine, [field]: value });
    }
  };

  const handlePartFieldChange = (partId: string, field: string, value: any) => {
    const part = allParts.find(p => p.id === partId);
    if (part && onPartUpdate) {
      onPartUpdate({ ...part, [field]: value });
    }
  };

  const getPartsForJobLine = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  const unassignedParts = allParts.filter(part => !part.job_line_id);

  const renderJobLineRow = (jobLine: WorkOrderJobLine) => (
    <SortableRow key={jobLine.id} id={jobLine.id} disabled={!isEditMode}>
      {isEditMode && (
        <TableCell className="w-8">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">LABOR</Badge>
          {isEditMode ? (
            <Input
              value={jobLine.name}
              onChange={(e) => handleJobLineFieldChange(jobLine.id, 'name', e.target.value)}
              className="h-8"
            />
          ) : (
            <span className="font-medium">{jobLine.name}</span>
          )}
        </div>
        {jobLine.description && (
          <div className="text-sm text-muted-foreground mt-1">{jobLine.description}</div>
        )}
      </TableCell>
      <TableCell>
        {isEditMode ? (
          <Input
            type="number"
            value={jobLine.estimated_hours || 0}
            onChange={(e) => handleJobLineFieldChange(jobLine.id, 'estimated_hours', parseFloat(e.target.value) || 0)}
            className="h-8 w-20"
            step="0.5"
          />
        ) : (
          `${jobLine.estimated_hours || 0} hrs`
        )}
      </TableCell>
      <TableCell>
        {isEditMode ? (
          <Input
            type="number"
            value={jobLine.labor_rate || 0}
            onChange={(e) => handleJobLineFieldChange(jobLine.id, 'labor_rate', parseFloat(e.target.value) || 0)}
            className="h-8 w-24"
            step="0.01"
          />
        ) : (
          `$${(jobLine.labor_rate || 0).toFixed(2)}`
        )}
      </TableCell>
      <TableCell>
        <span className="font-medium">
          ${((jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0)).toFixed(2)}
        </span>
      </TableCell>
      <TableCell>
        {isEditMode ? (
          <StatusSelector
            currentStatus={jobLine.status || 'pending'}
            type="jobLine"
            onStatusChange={(status) => handleJobLineStatusChange(jobLine.id, status)}
          />
        ) : (
          <StatusBadge status={jobLine.status || 'pending'} type="jobLine" />
        )}
      </TableCell>
      {isEditMode && (
        <TableCell className="w-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onJobLineDelete?.(jobLine.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
    </SortableRow>
  );

  const renderPartRow = (part: WorkOrderPart, isNested = false) => (
    <SortableRow key={part.id} id={part.id} disabled={!isEditMode}>
      {isEditMode && (
        <TableCell className="w-8">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
        </TableCell>
      )}
      <TableCell>
        <div className={`flex items-center gap-2 ${isNested ? 'ml-6' : ''}`}>
          <Package className="h-4 w-4 text-blue-500" />
          <Badge variant="outline" className="text-xs">PART</Badge>
          {isEditMode ? (
            <Input
              value={part.name}
              onChange={(e) => handlePartFieldChange(part.id, 'name', e.target.value)}
              className="h-8"
            />
          ) : (
            <span className="font-medium">{part.name}</span>
          )}
        </div>
        {part.part_number && (
          <div className={`text-sm text-muted-foreground mt-1 ${isNested ? 'ml-6' : ''}`}>
            Part #: {part.part_number}
          </div>
        )}
      </TableCell>
      <TableCell>
        {isEditMode ? (
          <Input
            type="number"
            value={part.quantity}
            onChange={(e) => handlePartFieldChange(part.id, 'quantity', parseInt(e.target.value) || 1)}
            className="h-8 w-20"
            min="1"
          />
        ) : (
          part.quantity
        )}
      </TableCell>
      <TableCell>
        {isEditMode ? (
          <Input
            type="number"
            value={part.unit_price}
            onChange={(e) => handlePartFieldChange(part.id, 'unit_price', parseFloat(e.target.value) || 0)}
            className="h-8 w-24"
            step="0.01"
          />
        ) : (
          `$${part.unit_price.toFixed(2)}`
        )}
      </TableCell>
      <TableCell>
        <span className="font-medium">
          ${(part.quantity * part.unit_price).toFixed(2)}
        </span>
      </TableCell>
      <TableCell>
        {isEditMode ? (
          <StatusSelector
            currentStatus={part.status || 'pending'}
            type="part"
            onStatusChange={(status) => handlePartStatusChange(part.id, status)}
          />
        ) : (
          <StatusBadge status={part.status || 'pending'} type="part" />
        )}
      </TableCell>
      {isEditMode && (
        <TableCell className="w-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPartDelete?.(part.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
    </SortableRow>
  );

  const renderOverviewRows = () => {
    const rows: React.ReactNode[] = [];
    
    // Render job lines with their associated parts
    jobLines.forEach(jobLine => {
      rows.push(renderJobLineRow(jobLine));
      
      // Add associated parts right after the job line
      const associatedParts = getPartsForJobLine(jobLine.id);
      associatedParts.forEach(part => {
        rows.push(renderPartRow(part, true));
      });
    });

    // Add unassigned parts at the end
    if (unassignedParts.length > 0) {
      rows.push(
        <TableRow key="unassigned-header">
          <TableCell colSpan={isEditMode ? 7 : 6} className="bg-gray-50 font-medium text-sm">
            Unassigned Parts
          </TableCell>
        </TableRow>
      );
      unassignedParts.forEach(part => {
        rows.push(renderPartRow(part));
      });
    }

    return rows;
  };

  const renderItems = () => {
    if (showType === 'overview') {
      return renderOverviewRows();
    } else if (showType === 'labor') {
      return jobLines.map(renderJobLineRow);
    } else if (showType === 'parts') {
      return allParts.map(part => renderPartRow(part));
    }
    return [];
  };

  const items = showType === 'overview' 
    ? [...jobLines.map(jl => jl.id), ...allParts.map(p => p.id)]
    : showType === 'labor' 
    ? jobLines.map(jl => jl.id)
    : allParts.map(p => p.id);

  if (jobLines.length === 0 && allParts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {showType === 'labor' ? 'job lines' : showType === 'parts' ? 'parts' : 'items'} found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <Table>
            <TableHeader>
              <TableRow>
                {isEditMode && <TableHead className="w-8"></TableHead>}
                <TableHead>Description</TableHead>
                <TableHead>Qty/Hours</TableHead>
                <TableHead>Rate/Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                {isEditMode && <TableHead className="w-8"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderItems()}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
    </div>
  );
}
