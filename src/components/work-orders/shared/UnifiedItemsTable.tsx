import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { ChevronDown, ChevronRight, Trash2, Edit3, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePartsDragDrop } from '@/hooks/usePartsDragDrop';
import { jobLineStatusMap, partStatusMap, JOB_LINE_STATUSES, WORK_ORDER_PART_STATUSES } from '@/types/jobLine';

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
  showType: 'all' | 'labor' | 'parts' | 'overview';
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
  const [expandedJobLines, setExpandedJobLines] = useState<Set<string>>(new Set());
  const [editingJobLine, setEditingJobLine] = useState<string | null>(null);
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const { handleDragEnd } = usePartsDragDrop(allParts, (parts) => {
    // Handle parts update if callback is provided
    if (onPartUpdate) {
      parts.forEach(part => onPartUpdate(part));
    }
  });

  const toggleJobLineExpansion = (jobLineId: string) => {
    const newExpanded = new Set(expandedJobLines);
    if (newExpanded.has(jobLineId)) {
      newExpanded.delete(jobLineId);
    } else {
      newExpanded.add(jobLineId);
    }
    setExpandedJobLines(newExpanded);
  };

  const handleJobLineEdit = (jobLine: WorkOrderJobLine, field: string, value: any) => {
    if (onJobLineUpdate) {
      onJobLineUpdate({ ...jobLine, [field]: value });
    }
    setEditingJobLine(null);
    setEditValues({});
  };

  const handlePartEdit = (part: WorkOrderPart, field: string, value: any) => {
    if (onPartUpdate) {
      onPartUpdate({ ...part, [field]: value });
    }
    setEditingPart(null);
    setEditValues({});
  };

  const getJobLineParts = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  const getUnassignedParts = () => {
    return allParts.filter(part => !part.job_line_id);
  };

  const calculateJobLineTotal = (jobLine: WorkOrderJobLine) => {
    const laborTotal = (jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0);
    const partsTotal = getJobLineParts(jobLine.id).reduce((sum, part) => 
      sum + (part.quantity * part.unit_price), 0
    );
    return laborTotal + partsTotal;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderStatusBadge = (status: string, type: 'jobLine' | 'part', item: WorkOrderJobLine | WorkOrderPart) => {
    const statusMap = type === 'jobLine' ? jobLineStatusMap : partStatusMap;
    const statusOptions = type === 'jobLine' ? JOB_LINE_STATUSES : WORK_ORDER_PART_STATUSES;
    const statusInfo = statusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
    
    if (!isEditMode) {
      return (
        <Badge variant="secondary" className={`${statusInfo.classes} text-xs font-medium`}>
          {statusInfo.label}
        </Badge>
      );
    }

    return (
      <Select
        value={status}
        onValueChange={(newStatus) => {
          if (type === 'jobLine' && onJobLineUpdate) {
            onJobLineUpdate({ ...(item as WorkOrderJobLine), status: newStatus });
          } else if (type === 'part' && onPartUpdate) {
            onPartUpdate({ ...(item as WorkOrderPart), status: newStatus });
          }
        }}
      >
        <SelectTrigger className="w-32 h-6 text-xs">
          <SelectValue>
            <Badge variant="secondary" className={`${statusInfo.classes} text-xs font-medium border-0`}>
              {statusInfo.label}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((statusOption) => {
            const optionInfo = statusMap[statusOption] || { label: statusOption, classes: 'bg-gray-100 text-gray-800' };
            return (
              <SelectItem key={statusOption} value={statusOption}>
                <Badge variant="secondary" className={`${optionInfo.classes} text-xs font-medium border-0`}>
                  {optionInfo.label}
                </Badge>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  };

  const renderDeleteButton = (type: 'jobLine' | 'part', id: string, name: string) => {
    if (!isEditMode) return null;

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {type === 'jobLine' ? 'Job Line' : 'Part'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (type === 'jobLine' && onJobLineDelete) {
                  onJobLineDelete(id);
                } else if (type === 'part' && onPartDelete) {
                  onPartDelete(id);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const renderJobLineRow = (jobLine: WorkOrderJobLine) => {
    const jobLineParts = getJobLineParts(jobLine.id);
    const isExpanded = expandedJobLines.has(jobLine.id);
    const hasEditableFields = editingJobLine === jobLine.id;

    return (
      <div key={jobLine.id} className="border rounded-lg mb-4">
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center gap-4">
            {/* Expand/Collapse Button */}
            {jobLineParts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleJobLineExpansion(jobLine.id)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Job Line Name */}
            <div className="flex-1">
              {hasEditableFields ? (
                <Input
                  value={editValues[`${jobLine.id}_name`] || jobLine.name}
                  onChange={(e) => setEditValues({...editValues, [`${jobLine.id}_name`]: e.target.value})}
                  onBlur={() => handleJobLineEdit(jobLine, 'name', editValues[`${jobLine.id}_name`] || jobLine.name)}
                  className="h-6 text-sm font-medium"
                  autoFocus
                />
              ) : (
                <span 
                  className="text-sm font-medium cursor-pointer hover:text-blue-600"
                  onClick={() => isEditMode && setEditingJobLine(jobLine.id)}
                >
                  {jobLine.name}
                </span>
              )}
            </div>

            {/* Hours */}
            <div className="w-20 text-right">
              {hasEditableFields ? (
                <Input
                  type="number"
                  value={editValues[`${jobLine.id}_hours`] || jobLine.estimated_hours || ''}
                  onChange={(e) => setEditValues({...editValues, [`${jobLine.id}_hours`]: parseFloat(e.target.value) || 0})}
                  onBlur={() => handleJobLineEdit(jobLine, 'estimated_hours', editValues[`${jobLine.id}_hours`] || jobLine.estimated_hours)}
                  className="h-6 text-xs text-right"
                />
              ) : (
                <span 
                  className="text-xs text-muted-foreground cursor-pointer"
                  onClick={() => isEditMode && setEditingJobLine(jobLine.id)}
                >
                  {jobLine.estimated_hours || 0}h
                </span>
              )}
            </div>

            {/* Rate */}
            <div className="w-24 text-right">
              {hasEditableFields ? (
                <Input
                  type="number"
                  value={editValues[`${jobLine.id}_rate`] || jobLine.labor_rate || ''}
                  onChange={(e) => setEditValues({...editValues, [`${jobLine.id}_rate`]: parseFloat(e.target.value) || 0})}
                  onBlur={() => handleJobLineEdit(jobLine, 'labor_rate', editValues[`${jobLine.id}_rate`] || jobLine.labor_rate)}
                  className="h-6 text-xs text-right"
                />
              ) : (
                <span 
                  className="text-xs text-muted-foreground cursor-pointer"
                  onClick={() => isEditMode && setEditingJobLine(jobLine.id)}
                >
                  {formatCurrency(jobLine.labor_rate || 0)}
                </span>
              )}
            </div>

            {/* Status */}
            <div className="w-32">
              {renderStatusBadge(jobLine.status || 'pending', 'jobLine', jobLine)}
            </div>

            {/* Total */}
            <div className="w-24 text-right">
              <span className="text-sm font-medium">
                {formatCurrency(calculateJobLineTotal(jobLine))}
              </span>
            </div>

            {/* Actions */}
            <div className="w-8 flex justify-end">
              {renderDeleteButton('jobLine', jobLine.id, jobLine.name)}
            </div>
          </div>
        </div>

        {/* Parts Section */}
        {isExpanded && jobLineParts.length > 0 && (
          <div className="p-2 bg-gray-50">
            {jobLineParts.map((part) => renderPartRow(part, true))}
          </div>
        )}
      </div>
    );
  };

  const renderPartRow = (part: WorkOrderPart, isNested = false) => {
    const hasEditableFields = editingPart === part.id;

    return (
      <div
        key={part.id}
        className={cn(
          "flex items-center gap-4 p-2 rounded",
          isNested ? "bg-white border ml-8" : "bg-gray-50 border"
        )}
      >
        {/* Part Icon */}
        <div className="w-6 flex justify-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>

        {/* Part Name */}
        <div className="flex-1">
          {hasEditableFields ? (
            <Input
              value={editValues[`${part.id}_name`] || part.name}
              onChange={(e) => setEditValues({...editValues, [`${part.id}_name`]: e.target.value})}
              onBlur={() => handlePartEdit(part, 'name', editValues[`${part.id}_name`] || part.name)}
              className="h-6 text-xs"
              autoFocus
            />
          ) : (
            <span 
              className="text-xs cursor-pointer hover:text-blue-600"
              onClick={() => isEditMode && setEditingPart(part.id)}
            >
              {part.name}
            </span>
          )}
        </div>

        {/* Quantity */}
        <div className="w-16 text-center">
          {hasEditableFields ? (
            <Input
              type="number"
              value={editValues[`${part.id}_quantity`] || part.quantity}
              onChange={(e) => setEditValues({...editValues, [`${part.id}_quantity`]: parseInt(e.target.value) || 1})}
              onBlur={() => handlePartEdit(part, 'quantity', editValues[`${part.id}_quantity`] || part.quantity)}
              className="h-6 text-xs text-center"
            />
          ) : (
            <span 
              className="text-xs text-muted-foreground cursor-pointer"
              onClick={() => isEditMode && setEditingPart(part.id)}
            >
              {part.quantity}
            </span>
          )}
        </div>

        {/* Unit Price */}
        <div className="w-24 text-right">
          {hasEditableFields ? (
            <Input
              type="number"
              value={editValues[`${part.id}_price`] || part.unit_price}
              onChange={(e) => setEditValues({...editValues, [`${part.id}_price`]: parseFloat(e.target.value) || 0})}
              onBlur={() => handlePartEdit(part, 'unit_price', editValues[`${part.id}_price`] || part.unit_price)}
              className="h-6 text-xs text-right"
            />
          ) : (
            <span 
              className="text-xs text-muted-foreground cursor-pointer"
              onClick={() => isEditMode && setEditingPart(part.id)}
            >
              {formatCurrency(part.unit_price)}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="w-32">
          {renderStatusBadge(part.status || 'pending', 'part', part)}
        </div>

        {/* Total */}
        <div className="w-24 text-right">
          <span className="text-xs font-medium">
            {formatCurrency(part.quantity * part.unit_price)}
          </span>
        </div>

        {/* Actions */}
        <div className="w-8 flex justify-end">
          {renderDeleteButton('part', part.id, part.name)}
        </div>
      </div>
    );
  };

  if (jobLines.length === 0 && allParts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No items added yet</p>
        {isEditMode && (
          <p className="text-xs mt-2">Add job lines and parts to get started</p>
        )}
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* Job Lines with their parts */}
        {(showType === 'all' || showType === 'labor' || showType === 'overview') && (
          <SortableContext items={jobLines.map(jl => jl.id)} strategy={verticalListSortingStrategy}>
            {jobLines.map(renderJobLineRow)}
          </SortableContext>
        )}

        {/* Unassigned Parts */}
        {(showType === 'all' || showType === 'parts' || showType === 'overview') && getUnassignedParts().length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Unassigned Parts</h4>
            <SortableContext items={getUnassignedParts().map(p => p.id)} strategy={verticalListSortingStrategy}>
              {getUnassignedParts().map(part => renderPartRow(part, false))}
            </SortableContext>
          </div>
        )}
      </div>
    </DndContext>
  );
}
