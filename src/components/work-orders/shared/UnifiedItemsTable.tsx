
import React from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusSelector } from './StatusSelector';
import { Trash2, Package, Clock, User, GripVertical } from 'lucide-react';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode: boolean;
  showType: 'overview' | 'parts' | 'labor';
  onReorderJobLines?: (reorderedJobLines: WorkOrderJobLine[]) => void;
  onReorderParts?: (reorderedParts: WorkOrderPart[]) => void;
}

interface DraggableRowProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function DraggableRow({ id, children, disabled = false }: DraggableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className={isDragging ? 'bg-gray-50' : ''}
    >
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          // First cell contains the drag handle
          return React.cloneElement(child as React.ReactElement, {
            ...attributes,
            ...listeners,
          });
        }
        return child;
      })}
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
  isEditMode,
  showType,
  onReorderJobLines,
  onReorderParts
}: UnifiedItemsTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're reordering job lines
    const activeJobLine = jobLines.find(jl => jl.id === activeId);
    const overJobLine = jobLines.find(jl => jl.id === overId);

    if (activeJobLine && overJobLine && onReorderJobLines) {
      const oldIndex = jobLines.indexOf(activeJobLine);
      const newIndex = jobLines.indexOf(overJobLine);
      
      const reorderedJobLines = [...jobLines];
      reorderedJobLines.splice(oldIndex, 1);
      reorderedJobLines.splice(newIndex, 0, activeJobLine);
      
      onReorderJobLines(reorderedJobLines);
      return;
    }

    // Check if we're reordering parts
    const activePart = allParts.find(p => p.id === activeId);
    const overPart = allParts.find(p => p.id === overId);

    if (activePart && overPart && onReorderParts) {
      const oldIndex = allParts.indexOf(activePart);
      const newIndex = allParts.indexOf(overPart);
      
      const reorderedParts = [...allParts];
      reorderedParts.splice(oldIndex, 1);
      reorderedParts.splice(newIndex, 0, activePart);
      
      onReorderParts(reorderedParts);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${amount.toFixed(2)}`;
  };

  const formatHours = (hours?: number) => {
    if (hours === undefined || hours === null) return '0.0';
    return hours.toFixed(1);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderJobLines = () => {
    if (showType === 'parts') return null;

    return jobLines.map((jobLine) => (
      <DraggableRow 
        key={jobLine.id} 
        id={jobLine.id}
        disabled={!isEditMode}
      >
        <td className="px-4 py-3 w-8">
          {isEditMode && (
            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab hover:text-gray-600" />
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <div>
              <div className="font-medium text-sm">{jobLine.name}</div>
              {jobLine.description && (
                <div className="text-xs text-gray-500 mt-1">{jobLine.description}</div>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          {jobLine.category && (
            <Badge variant="outline" className="text-xs">
              {jobLine.category}
            </Badge>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-center">
          {formatHours(jobLine.estimated_hours)} hrs
        </td>
        <td className="px-4 py-3 text-sm text-right">
          {formatCurrency(jobLine.labor_rate)}/hr
        </td>
        <td className="px-4 py-3 text-sm text-right font-medium">
          {formatCurrency(jobLine.total_amount)}
        </td>
        <td className="px-4 py-3">
          {isEditMode && onJobLineUpdate ? (
            <StatusSelector
              currentStatus={jobLine.status || 'pending'}
              type="jobLine"
              onStatusChange={(newStatus) => 
                onJobLineUpdate({ ...jobLine, status: newStatus })
              }
            />
          ) : (
            <Badge className={`text-xs ${getStatusColor(jobLine.status)}`}>
              {jobLine.status || 'pending'}
            </Badge>
          )}
        </td>
        <td className="px-4 py-3">
          {isEditMode && onJobLineDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onJobLineDelete(jobLine.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </td>
      </DraggableRow>
    ));
  };

  const renderParts = () => {
    if (showType === 'labor') return null;

    return allParts.map((part) => (
      <DraggableRow 
        key={part.id} 
        id={part.id}
        disabled={!isEditMode}
      >
        <td className="px-4 py-3 w-8">
          {isEditMode && (
            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab hover:text-gray-600" />
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-green-500" />
            <div>
              <div className="font-medium text-sm">{part.name}</div>
              {part.description && (
                <div className="text-xs text-gray-500 mt-1">{part.description}</div>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            {part.part_number || 'N/A'}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-center">
          {part.quantity || 0}
        </td>
        <td className="px-4 py-3 text-sm text-right">
          {formatCurrency(part.unit_price)}
        </td>
        <td className="px-4 py-3 text-sm text-right font-medium">
          {formatCurrency((part.quantity || 0) * (part.unit_price || 0))}
        </td>
        <td className="px-4 py-3">
          {isEditMode && onPartUpdate ? (
            <StatusSelector
              currentStatus={part.status || 'pending'}
              type="part"
              onStatusChange={(newStatus) => 
                onPartUpdate({ ...part, status: newStatus })
              }
            />
          ) : (
            <Badge className={`text-xs ${getStatusColor(part.status)}`}>
              {part.status || 'pending'}
            </Badge>
          )}
        </td>
        <td className="px-4 py-3">
          {isEditMode && onPartDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPartDelete(part.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </td>
      </DraggableRow>
    ));
  };

  const items = showType === 'labor' ? jobLines : showType === 'parts' ? allParts : [...jobLines, ...allParts];
  const itemIds = items.map(item => item.id);

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          {showType === 'labor' ? <User className="h-5 w-5" /> : <Package className="h-5 w-5" />}
          <span className="font-medium">
            No {showType === 'labor' ? 'job lines' : showType === 'parts' ? 'parts' : 'items'} found
          </span>
        </div>
        <p className="text-sm">
          {showType === 'labor' 
            ? 'Add job lines to track labor work' 
            : showType === 'parts' 
            ? 'Add parts to track inventory usage'
            : 'Add job lines or parts to get started'
          }
        </p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {showType === 'labor' ? 'Job Line' : showType === 'parts' ? 'Part' : 'Item'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {showType === 'parts' ? 'Part #' : 'Category'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {showType === 'labor' ? 'Hours' : 'Qty'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {showType === 'labor' ? 'Rate' : 'Unit Price'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderJobLines()}
              {renderParts()}
            </tbody>
          </table>
        </SortableContext>
      </div>
    </DndContext>
  );
}
