
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';
import { partStatusMap } from '@/types/workOrderPart';
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
  useSortable,
} from '@dnd-kit/sortable';
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
  isEditMode?: boolean;
  showType?: 'overview' | 'labor' | 'parts';
}

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
  isEditMode?: boolean;
}

function SortableRow({ id, children, isEditMode }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b hover:bg-muted/50 ${isDragging ? 'bg-muted' : ''}`}
    >
      {isEditMode && (
        <td className="p-2 w-8">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </td>
      )}
      {children}
    </tr>
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
  isEditMode = false,
  showType = 'overview'
}: UnifiedItemsTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Handle job line reordering
    if (showType === 'labor' && onReorderJobLines) {
      const oldIndex = jobLines.findIndex(item => item.id === active.id);
      const newIndex = jobLines.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedJobLines = arrayMove(jobLines, oldIndex, newIndex);
        onReorderJobLines(reorderedJobLines);
      }
    }

    // Handle parts reordering
    if (showType === 'parts' && onReorderParts) {
      const oldIndex = allParts.findIndex(item => item.id === active.id);
      const newIndex = allParts.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedParts = arrayMove(allParts, oldIndex, newIndex);
        onReorderParts(reorderedParts);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderJobLines = () => {
    if (!jobLines.length) {
      return (
        <tr>
          <td colSpan={isEditMode ? 7 : 6} className="p-4 text-center text-muted-foreground">
            No job lines found
          </td>
        </tr>
      );
    }

    return jobLines.map((jobLine) => (
      <SortableRow key={jobLine.id} id={jobLine.id} isEditMode={isEditMode}>
        <td className="p-3 font-medium">{jobLine.name}</td>
        <td className="p-3 text-sm text-muted-foreground">
          {jobLine.category && jobLine.subcategory 
            ? `${jobLine.category} / ${jobLine.subcategory}`
            : jobLine.category || 'Labor'
          }
        </td>
        <td className="p-3 text-sm">{jobLine.estimated_hours || 0} hrs</td>
        <td className="p-3 text-sm">{formatCurrency(jobLine.labor_rate || 0)}/hr</td>
        <td className="p-3 font-medium">{formatCurrency(jobLine.total_amount || 0)}</td>
        <td className="p-3">
          <Badge 
            variant="outline" 
            className={jobLineStatusMap[jobLine.status || 'pending']?.classes}
          >
            {jobLineStatusMap[jobLine.status || 'pending']?.label || 'Pending'}
          </Badge>
        </td>
        {isEditMode && (
          <td className="p-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onJobLineUpdate?.(jobLine)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onJobLineDelete?.(jobLine.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        )}
      </SortableRow>
    ));
  };

  const renderParts = () => {
    if (!allParts.length) {
      return (
        <tr>
          <td colSpan={isEditMode ? 7 : 6} className="p-4 text-center text-muted-foreground">
            No parts found
          </td>
        </tr>
      );
    }

    return allParts.map((part) => (
      <SortableRow key={part.id} id={part.id} isEditMode={isEditMode}>
        <td className="p-3 font-medium">{part.name}</td>
        <td className="p-3 text-sm text-muted-foreground">{part.part_number}</td>
        <td className="p-3 text-sm">{part.quantity}</td>
        <td className="p-3 text-sm">{formatCurrency(part.unit_price)}</td>
        <td className="p-3 font-medium">{formatCurrency(part.total_price)}</td>
        <td className="p-3">
          <Badge 
            variant="outline" 
            className={partStatusMap[part.status || 'pending']?.classes}
          >
            {partStatusMap[part.status || 'pending']?.label || 'Pending'}
          </Badge>
        </td>
        {isEditMode && (
          <td className="p-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPartUpdate?.(part)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPartDelete?.(part.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        )}
      </SortableRow>
    ));
  };

  const renderOverview = () => {
    const allItems = [
      ...jobLines.map(line => ({ ...line, type: 'jobLine' as const })),
      ...allParts.map(part => ({ ...part, type: 'part' as const }))
    ];

    if (!allItems.length) {
      return (
        <tr>
          <td colSpan={isEditMode ? 7 : 6} className="p-4 text-center text-muted-foreground">
            No items found
          </td>
        </tr>
      );
    }

    return allItems.map((item) => (
      <tr key={`${item.type}-${item.id}`} className="border-b hover:bg-muted/50">
        {isEditMode && (
          <td className="p-2 w-8">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </td>
        )}
        <td className="p-3 font-medium">
          {item.type === 'jobLine' ? item.name : item.name}
        </td>
        <td className="p-3 text-sm text-muted-foreground">
          {item.type === 'jobLine' 
            ? (item.category && item.subcategory 
                ? `${item.category} / ${item.subcategory}`
                : item.category || 'Labor'
              )
            : item.part_number
          }
        </td>
        <td className="p-3 text-sm">
          {item.type === 'jobLine' 
            ? `${item.estimated_hours || 0} hrs`
            : `Qty: ${item.quantity}`
          }
        </td>
        <td className="p-3 text-sm">
          {item.type === 'jobLine' 
            ? `${formatCurrency(item.labor_rate || 0)}/hr`
            : formatCurrency(item.unit_price)
          }
        </td>
        <td className="p-3 font-medium">
          {formatCurrency(item.type === 'jobLine' ? item.total_amount || 0 : item.total_price)}
        </td>
        <td className="p-3">
          <Badge 
            variant="outline" 
            className={
              item.type === 'jobLine' 
                ? jobLineStatusMap[item.status || 'pending']?.classes
                : partStatusMap[item.status || 'pending']?.classes
            }
          >
            {item.type === 'jobLine' 
              ? jobLineStatusMap[item.status || 'pending']?.label || 'Pending'
              : partStatusMap[item.status || 'pending']?.label || 'Pending'
            }
          </Badge>
        </td>
        {isEditMode && (
          <td className="p-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (item.type === 'jobLine') {
                    onJobLineUpdate?.(item);
                  } else {
                    onPartUpdate?.(item);
                  }
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (item.type === 'jobLine') {
                    onJobLineDelete?.(item.id);
                  } else {
                    onPartDelete?.(item.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        )}
      </tr>
    ));
  };

  const getItemIds = () => {
    if (showType === 'labor') return jobLines.map(line => line.id);
    if (showType === 'parts') return allParts.map(part => part.id);
    return [
      ...jobLines.map(line => line.id),
      ...allParts.map(part => part.id)
    ];
  };

  const renderTableHeader = () => (
    <thead className="bg-muted/50">
      <tr>
        {isEditMode && <th className="p-3 text-left w-8"></th>}
        <th className="p-3 text-left font-medium">Item</th>
        <th className="p-3 text-left font-medium">
          {showType === 'parts' ? 'Part Number' : 'Category/Part #'}
        </th>
        <th className="p-3 text-left font-medium">
          {showType === 'labor' ? 'Hours' : showType === 'parts' ? 'Quantity' : 'Qty/Hours'}
        </th>
        <th className="p-3 text-left font-medium">Unit Price</th>
        <th className="p-3 text-left font-medium">Total</th>
        <th className="p-3 text-left font-medium">Status</th>
        {isEditMode && <th className="p-3 text-left font-medium">Actions</th>}
      </tr>
    </thead>
  );

  return (
    <div className="rounded-md border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={getItemIds()} strategy={verticalListSortingStrategy}>
          <table className="w-full">
            {renderTableHeader()}
            <tbody>
              {showType === 'labor' && renderJobLines()}
              {showType === 'parts' && renderParts()}
              {showType === 'overview' && renderOverview()}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
}
