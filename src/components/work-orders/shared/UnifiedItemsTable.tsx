
import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  GripVertical, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Save,
  X,
  Clock,
  DollarSign,
  Package,
  Wrench
} from 'lucide-react';
import { JOB_LINE_STATUSES, jobLineStatusMap } from '@/types/jobLine';
import { WORK_ORDER_PART_STATUSES, partStatusMap } from '@/types/workOrderPart';

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
  showType?: 'overview' | 'labor' | 'parts';
}

interface SortableJobLineRowProps {
  jobLine: WorkOrderJobLine;
  parts: WorkOrderPart[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode: boolean;
}

function SortableJobLineRow({ 
  jobLine, 
  parts, 
  onUpdate, 
  onDelete, 
  onPartUpdate, 
  onPartDelete, 
  isEditMode 
}: SortableJobLineRowProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(jobLine);

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

  const handleSave = () => {
    onUpdate?.(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(jobLine);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = jobLineStatusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="secondary" className={`${statusInfo.classes} text-xs`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPartStatusBadge = (status: string) => {
    const statusInfo = partStatusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={`${statusInfo.classes} text-xs`}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg mb-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-blue-50 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {isEditMode && (
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab hover:cursor-grabbing p-1"
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
              )}
              
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <Wrench className="h-4 w-4 text-blue-600" />

              <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                {isEditing ? (
                  <>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="text-sm"
                      placeholder="Job line name"
                    />
                    <Input
                      type="number"
                      value={editData.estimated_hours || 0}
                      onChange={(e) => setEditData({ ...editData, estimated_hours: parseFloat(e.target.value) || 0 })}
                      className="text-sm"
                      placeholder="Hours"
                    />
                    <Input
                      type="number"
                      value={editData.labor_rate || 0}
                      onChange={(e) => setEditData({ ...editData, labor_rate: parseFloat(e.target.value) || 0 })}
                      className="text-sm"
                      placeholder="Rate"
                    />
                    <div className="text-sm font-medium">
                      ${((editData.estimated_hours || 0) * (editData.labor_rate || 0)).toFixed(2)}
                    </div>
                    <Select
                      value={editData.status || 'pending'}
                      onValueChange={(value) => setEditData({ ...editData, status: value })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_LINE_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {jobLineStatusMap[status]?.label || status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} className="h-8 px-2">
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 px-2">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-medium text-sm">{jobLine.name}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      {jobLine.estimated_hours || 0}h
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <DollarSign className="h-3 w-3" />
                      ${jobLine.labor_rate || 0}/hr
                    </div>
                    <div className="font-medium text-sm">
                      ${((jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0)).toFixed(2)}
                    </div>
                    {getStatusBadge(jobLine.status || 'pending')}
                    {isEditMode && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="h-8 px-2"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete?.(jobLine.id)}
                          className="h-8 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {isEditing && editData.description && (
            <div className="mt-3">
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Job line description"
                className="text-sm"
                rows={2}
              />
            </div>
          )}
        </div>

        <CollapsibleContent>
          {parts.length > 0 ? (
            <div className="p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Associated Parts ({parts.length})
                </span>
                {isEditMode && (
                  <Button size="sm" variant="outline" className="h-7 px-2 ml-auto">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Part
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {parts.map((part) => (
                  <PartRow
                    key={part.id}
                    part={part}
                    onUpdate={onPartUpdate}
                    onDelete={onPartDelete}
                    isEditMode={isEditMode}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50">
              <div className="text-center py-4">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No parts associated with this job line</p>
                {isEditMode && (
                  <Button size="sm" variant="outline" className="mt-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Part
                  </Button>
                )}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function PartRow({ 
  part, 
  onUpdate, 
  onDelete, 
  isEditMode 
}: { 
  part: WorkOrderPart; 
  onUpdate?: (part: WorkOrderPart) => void; 
  onDelete?: (partId: string) => void; 
  isEditMode: boolean; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(part);

  const handleSave = () => {
    onUpdate?.(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(part);
    setIsEditing(false);
  };

  const getPartStatusBadge = (status: string) => {
    const statusInfo = partStatusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={`${statusInfo.classes} text-xs`}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="bg-white border rounded p-3">
      <div className="grid grid-cols-7 gap-3 items-center">
        {isEditing ? (
          <>
            <Input
              value={editData.part_number}
              onChange={(e) => setEditData({ ...editData, part_number: e.target.value })}
              className="text-sm"
              placeholder="Part number"
            />
            <Input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="text-sm"
              placeholder="Part name"
            />
            <Input
              type="number"
              value={editData.quantity}
              onChange={(e) => setEditData({ ...editData, quantity: parseInt(e.target.value) || 1 })}
              className="text-sm"
              placeholder="Qty"
            />
            <Input
              type="number"
              value={editData.unit_price}
              onChange={(e) => setEditData({ ...editData, unit_price: parseFloat(e.target.value) || 0 })}
              className="text-sm"
              placeholder="Price"
            />
            <div className="text-sm font-medium">
              ${(editData.quantity * editData.unit_price).toFixed(2)}
            </div>
            <Select
              value={editData.status || 'pending'}
              onValueChange={(value) => setEditData({ ...editData, status: value })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDER_PART_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {partStatusMap[status]?.label || status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button size="sm" onClick={handleSave} className="h-7 px-2">
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 px-2">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-mono text-gray-600">{part.part_number}</div>
            <div className="text-sm font-medium">{part.name}</div>
            <div className="text-sm text-center">{part.quantity}</div>
            <div className="text-sm">${part.unit_price?.toFixed(2) || '0.00'}</div>
            <div className="text-sm font-medium">${part.total_price?.toFixed(2) || '0.00'}</div>
            {getPartStatusBadge(part.status || 'pending')}
            {isEditMode && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="h-7 px-2"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete?.(part.id)}
                  className="h-7 px-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function UnifiedItemsTable({
  jobLines = [],
  allParts = [],
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  onReorderJobLines,
  isEditMode,
  showType = 'overview'
}: UnifiedItemsTableProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !onReorderJobLines) return;
    
    if (active.id !== over.id) {
      const oldIndex = jobLines.findIndex((item) => item.id === active.id);
      const newIndex = jobLines.findIndex((item) => item.id === over.id);
      
      const newJobLines = [...jobLines];
      const [removed] = newJobLines.splice(oldIndex, 1);
      newJobLines.splice(newIndex, 0, removed);
      
      onReorderJobLines(newJobLines);
    }
  };

  // Group parts by job line
  const getPartsForJobLine = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  if (jobLines.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job lines yet</h3>
            <p className="text-gray-500 mb-4">Add job lines to track labor and associated parts</p>
            {isEditMode && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Job Line
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
          <div>Job Line</div>
          <div>Hours</div>
          <div>Rate</div>
          <div>Total</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
      </div>

      {/* Job Lines */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={jobLines.map(jl => jl.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {jobLines.map((jobLine) => {
              const associatedParts = getPartsForJobLine(jobLine.id);
              
              return (
                <SortableJobLineRow
                  key={jobLine.id}
                  jobLine={jobLine}
                  parts={associatedParts}
                  onUpdate={onJobLineUpdate}
                  onDelete={onJobLineDelete}
                  onPartUpdate={onPartUpdate}
                  onPartDelete={onPartDelete}
                  isEditMode={isEditMode}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Hours:</span>
            <span className="ml-2 font-medium">
              {jobLines.reduce((sum, jl) => sum + (jl.estimated_hours || 0), 0).toFixed(1)}h
            </span>
          </div>
          <div>
            <span className="text-gray-600">Labor Total:</span>
            <span className="ml-2 font-medium">
              ${jobLines.reduce((sum, jl) => sum + ((jl.estimated_hours || 0) * (jl.labor_rate || 0)), 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Parts Total:</span>
            <span className="ml-2 font-medium">
              ${allParts.reduce((sum, part) => sum + (part.total_price || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
