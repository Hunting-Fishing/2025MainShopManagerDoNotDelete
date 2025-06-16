import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2,
  Check,
  X
} from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { StatusSelector } from './StatusSelector';
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
} from "@/components/ui/alert-dialog";

interface StatusInfo {
  label: string;
  classes: string;
}

const getStatusInfo = (status: string, type: 'jobLine' | 'part'): StatusInfo => {
  const statusMap = type === 'jobLine' ? jobLineStatusMap : partStatusMap;
  return statusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
};

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (id: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (id: string) => void;
  onReorderJobLines?: (jobLines: WorkOrderJobLine[]) => void;
  onReorderParts?: (parts: WorkOrderPart[]) => void;
  isEditMode: boolean;
  showType?: 'all' | 'labor' | 'parts';
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
  showType = 'all'
}: UnifiedItemsTableProps) {
  const [collapsedJobLines, setCollapsedJobLines] = useState<Set<string>>(new Set());
  const [editingJobLine, setEditingJobLine] = useState<string | null>(null);
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  const toggleJobLineCollapse = (jobLineId: string) => {
    const newCollapsed = new Set(collapsedJobLines);
    if (newCollapsed.has(jobLineId)) {
      newCollapsed.delete(jobLineId);
    } else {
      newCollapsed.add(jobLineId);
    }
    setCollapsedJobLines(newCollapsed);
  };

  const handleEdit = (item: WorkOrderJobLine | WorkOrderPart, type: 'jobLine' | 'part') => {
    if (type === 'jobLine') {
      setEditingJobLine(item.id);
      setEditValues({
        name: item.name,
        description: item.description || '',
        estimated_hours: (item as WorkOrderJobLine).estimated_hours || 0,
        labor_rate: (item as WorkOrderJobLine).labor_rate || 0,
        status: item.status || 'pending'
      });
    } else {
      setEditingPart(item.id);
      setEditValues({
        name: item.name,
        part_number: (item as WorkOrderPart).part_number,
        quantity: (item as WorkOrderPart).quantity || 1,
        unit_price: (item as WorkOrderPart).unit_price || 0,
        status: item.status || 'pending'
      });
    }
  };

  const handleSave = (id: string, type: 'jobLine' | 'part') => {
    if (type === 'jobLine') {
      const jobLine = jobLines.find(jl => jl.id === id);
      if (jobLine && onJobLineUpdate) {
        onJobLineUpdate({
          ...jobLine,
          ...editValues,
          total_amount: (editValues.estimated_hours || 0) * (editValues.labor_rate || 0)
        });
      }
      setEditingJobLine(null);
    } else {
      const part = allParts.find(p => p.id === id);
      if (part && onPartUpdate) {
        onPartUpdate({
          ...part,
          ...editValues,
          total_price: (editValues.quantity || 1) * (editValues.unit_price || 0)
        });
      }
      setEditingPart(null);
    }
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingJobLine(null);
    setEditingPart(null);
    setEditValues({});
  };

  const handleStatusChange = (item: WorkOrderJobLine | WorkOrderPart, newStatus: string, type: 'jobLine' | 'part') => {
    if (type === 'jobLine' && onJobLineUpdate) {
      onJobLineUpdate({ ...item as WorkOrderJobLine, status: newStatus });
    } else if (type === 'part' && onPartUpdate) {
      onPartUpdate({ ...item as WorkOrderPart, status: newStatus });
    }
  };

  const getStatusBadge = (status: string, item: WorkOrderJobLine | WorkOrderPart, type: 'jobLine' | 'part') => {
    const statusInfo = getStatusInfo(status, type);
    
    if (isEditMode) {
      return (
        <StatusSelector
          currentStatus={status}
          type={type}
          onStatusChange={(newStatus) => handleStatusChange(item, newStatus, type)}
          disabled={false}
        />
      );
    }
    
    return (
      <Badge className={`${statusInfo.classes} cursor-pointer hover:opacity-80 transition-opacity`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const DeleteButton = ({ onDelete, itemName }: { onDelete: () => void; itemName: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{itemName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (showType === 'labor' || showType === 'all') {
    return (
      <div className="space-y-3">
        {jobLines.map((jobLine) => {
          const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
          const isCollapsed = collapsedJobLines.has(jobLine.id);
          const isEditing = editingJobLine === jobLine.id;

          return (
            <Card key={jobLine.id} className="overflow-hidden">
              {/* Job Line Header */}
              <div className="bg-blue-50 border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleJobLineCollapse(jobLine.id)}
                      className="h-6 w-6 p-0"
                    >
                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>

                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        {isEditing ? (
                          <Input
                            value={editValues.name || ''}
                            onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                            className="h-8"
                            placeholder="Job line name"
                          />
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900">{jobLine.name}</div>
                            {jobLine.description && (
                              <div className="text-sm text-gray-600">{jobLine.description}</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="col-span-2">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.estimated_hours || 0}
                            onChange={(e) => setEditValues({...editValues, estimated_hours: parseFloat(e.target.value) || 0})}
                            className="h-8"
                            placeholder="Hours"
                          />
                        ) : (
                          <span className="text-sm">{jobLine.estimated_hours || 0} hrs</span>
                        )}
                      </div>

                      <div className="col-span-2">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.labor_rate || 0}
                            onChange={(e) => setEditValues({...editValues, labor_rate: parseFloat(e.target.value) || 0})}
                            className="h-8"
                            placeholder="Rate"
                          />
                        ) : (
                          <span className="text-sm">${jobLine.labor_rate || 0}/hr</span>
                        )}
                      </div>

                      <div className="col-span-2">
                        <span className="text-sm font-medium">
                          ${((jobLine.estimated_hours || 0) * (jobLine.labor_rate || 0)).toFixed(2)}
                        </span>
                      </div>

                      <div className="col-span-1">
                        {getStatusBadge(jobLine.status || 'pending', jobLine, 'jobLine')}
                      </div>

                      <div className="col-span-1 flex justify-end gap-1">
                        {isEditMode && (
                          <>
                            {isEditing ? (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSave(jobLine.id, 'jobLine')}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancel}
                                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(jobLine, 'jobLine')}
                                  className="h-8 px-2 text-xs"
                                >
                                  Edit
                                </Button>
                                <DeleteButton
                                  onDelete={() => onJobLineDelete?.(jobLine.id)}
                                  itemName={jobLine.name}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parts Section */}
              {!isCollapsed && (
                <div className="p-4">
                  {jobLineParts.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 mb-3">Associated Parts</div>
                      <div className="space-y-2">
                        {jobLineParts.map((part) => {
                          const isEditingThisPart = editingPart === part.id;
                          
                          return (
                            <div key={part.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-3">
                                  {isEditingThisPart ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={editValues.name || ''}
                                        onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                                        className="h-8"
                                        placeholder="Part name"
                                      />
                                      <Input
                                        value={editValues.part_number || ''}
                                        onChange={(e) => setEditValues({...editValues, part_number: e.target.value})}
                                        className="h-8"
                                        placeholder="Part number"
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="font-medium text-sm">{part.name}</div>
                                      <div className="text-xs text-gray-600">#{part.part_number}</div>
                                    </div>
                                  )}
                                </div>

                                <div className="col-span-2">
                                  {isEditingThisPart ? (
                                    <Input
                                      type="number"
                                      value={editValues.quantity || 1}
                                      onChange={(e) => setEditValues({...editValues, quantity: parseInt(e.target.value) || 1})}
                                      className="h-8"
                                      placeholder="Qty"
                                    />
                                  ) : (
                                    <span className="text-sm">{part.quantity}</span>
                                  )}
                                </div>

                                <div className="col-span-2">
                                  {isEditingThisPart ? (
                                    <Input
                                      type="number"
                                      value={editValues.unit_price || 0}
                                      onChange={(e) => setEditValues({...editValues, unit_price: parseFloat(e.target.value) || 0})}
                                      className="h-8"
                                      placeholder="Price"
                                    />
                                  ) : (
                                    <span className="text-sm">${part.unit_price || 0}</span>
                                  )}
                                </div>

                                <div className="col-span-2">
                                  <span className="text-sm font-medium">
                                    ${((part.quantity || 1) * (part.unit_price || 0)).toFixed(2)}
                                  </span>
                                </div>

                                <div className="col-span-2">
                                  {getStatusBadge(part.status || 'pending', part, 'part')}
                                </div>

                                <div className="col-span-1 flex justify-end gap-1">
                                  {isEditMode && (
                                    <>
                                      {isEditingThisPart ? (
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSave(part.id, 'part')}
                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                          >
                                            <Check className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancel}
                                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(part, 'part')}
                                            className="h-8 px-2 text-xs"
                                          >
                                            Edit
                                          </Button>
                                          <DeleteButton
                                            onDelete={() => onPartDelete?.(part.id)}
                                            itemName={part.name}
                                          />
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">No parts associated with this job line</div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {jobLines.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No job lines found
          </div>
        )}
      </div>
    );
  }

  // Parts only view
  if (showType === 'parts') {
    return (
      <div className="space-y-3">
        {allParts.filter(part => !part.job_line_id).map((part) => {
          const isEditingThisPart = editingPart === part.id;
          
          return (
            <Card key={part.id} className="p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  {isEditingThisPart ? (
                    <div className="space-y-2">
                      <Input
                        value={editValues.name || ''}
                        onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                        className="h-8"
                        placeholder="Part name"
                      />
                      <Input
                        value={editValues.part_number || ''}
                        onChange={(e) => setEditValues({...editValues, part_number: e.target.value})}
                        className="h-8"
                        placeholder="Part number"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">{part.name}</div>
                      <div className="text-sm text-gray-600">#{part.part_number}</div>
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  {isEditingThisPart ? (
                    <Input
                      type="number"
                      value={editValues.quantity || 1}
                      onChange={(e) => setEditValues({...editValues, quantity: parseInt(e.target.value) || 1})}
                      className="h-8"
                      placeholder="Qty"
                    />
                  ) : (
                    <span>{part.quantity}</span>
                  )}
                </div>

                <div className="col-span-2">
                  {isEditingThisPart ? (
                    <Input
                      type="number"
                      value={editValues.unit_price || 0}
                      onChange={(e) => setEditValues({...editValues, unit_price: parseFloat(e.target.value) || 0})}
                      className="h-8"
                      placeholder="Price"
                    />
                  ) : (
                    <span>${part.unit_price || 0}</span>
                  )}
                </div>

                <div className="col-span-2">
                  <span className="font-medium">
                    ${((part.quantity || 1) * (part.unit_price || 0)).toFixed(2)}
                  </span>
                </div>

                <div className="col-span-2">
                  {getStatusBadge(part.status || 'pending', part, 'part')}
                </div>

                <div className="col-span-1 flex justify-end gap-1">
                  {isEditMode && (
                    <>
                      {isEditingThisPart ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSave(part.id, 'part')}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(part, 'part')}
                            className="h-8 px-2 text-xs"
                          >
                            Edit
                          </Button>
                          <DeleteButton
                            onDelete={() => onPartDelete?.(part.id)}
                            itemName={part.name}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {allParts.filter(part => !part.job_line_id).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No standalone parts found
          </div>
        )}
      </div>
    );
  }

  return null;
}
