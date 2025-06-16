
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Plus
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode: boolean;
  showType: 'all' | 'labor' | 'parts';
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const getStatusColor = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status);
  return option?.color || 'bg-gray-100 text-gray-800';
};

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode,
  showType
}: UnifiedItemsTableProps) {
  const [expandedJobLines, setExpandedJobLines] = useState<Set<string>>(new Set());
  const [editingJobLine, setEditingJobLine] = useState<string | null>(null);
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const toggleJobLineExpansion = (jobLineId: string) => {
    const newExpanded = new Set(expandedJobLines);
    if (newExpanded.has(jobLineId)) {
      newExpanded.delete(jobLineId);
    } else {
      newExpanded.add(jobLineId);
    }
    setExpandedJobLines(newExpanded);
  };

  const startEditingJobLine = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine.id);
    setEditData({
      description: jobLine.description || '',
      hours: jobLine.hours || 0,
      hourly_rate: jobLine.hourly_rate || 0,
      status: jobLine.status || 'pending',
      notes: jobLine.notes || ''
    });
  };

  const startEditingPart = (part: WorkOrderPart) => {
    setEditingPart(part.id);
    setEditData({
      quantity: part.quantity || 0,
      unit_cost: part.unit_cost || 0,
      status: part.status || 'pending',
      notes: part.notes || ''
    });
  };

  const saveJobLineEdit = () => {
    if (editingJobLine && onJobLineUpdate) {
      const jobLine = jobLines.find(jl => jl.id === editingJobLine);
      if (jobLine) {
        onJobLineUpdate({
          ...jobLine,
          ...editData
        });
      }
    }
    setEditingJobLine(null);
    setEditData({});
  };

  const savePartEdit = () => {
    if (editingPart && onPartUpdate) {
      const part = allParts.find(p => p.id === editingPart);
      if (part) {
        onPartUpdate({
          ...part,
          ...editData
        });
      }
    }
    setEditingPart(null);
    setEditData({});
  };

  const cancelEdit = () => {
    setEditingJobLine(null);
    setEditingPart(null);
    setEditData({});
  };

  const getJobLineParts = (jobLineId: string) => {
    return allParts.filter(part => part.job_line_id === jobLineId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (jobLines.length === 0 && allParts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No labor or parts items found for this work order.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobLines.map((jobLine) => {
        const jobLineParts = getJobLineParts(jobLine.id);
        const isExpanded = expandedJobLines.has(jobLine.id);
        const isEditing = editingJobLine === jobLine.id;
        const totalAmount = (jobLine.hours || 0) * (jobLine.hourly_rate || 0);

        return (
          <Card key={jobLine.id} className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
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
                  
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editData.description || ''}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          placeholder="Job description"
                          className="font-medium"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground">Hours</label>
                            <Input
                              type="number"
                              step="0.25"
                              value={editData.hours || ''}
                              onChange={(e) => setEditData({ ...editData, hours: parseFloat(e.target.value) || 0 })}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Rate/Hr</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editData.hourly_rate || ''}
                              onChange={(e) => setEditData({ ...editData, hourly_rate: parseFloat(e.target.value) || 0 })}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Status</label>
                          <Select
                            value={editData.status || 'pending'}
                            onValueChange={(value) => setEditData({ ...editData, status: value })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea
                          value={editData.notes || ''}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          placeholder="Notes (optional)"
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">{jobLine.description}</div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>{jobLine.hours}h × {formatCurrency(jobLine.hourly_rate || 0)}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
                        </div>
                        {jobLine.notes && (
                          <div className="text-sm text-muted-foreground mt-1">{jobLine.notes}</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={saveJobLineEdit} className="h-8">
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        {isEditMode ? (
                          <Select
                            value={jobLine.status || 'pending'}
                            onValueChange={(value) => onJobLineUpdate?.({ ...jobLine, status: value })}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <Badge className={getStatusColor(jobLine.status || 'pending')}>
                                {statusOptions.find(opt => opt.value === (jobLine.status || 'pending'))?.label || 'Pending'}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <Badge className={option.color}>
                                    {option.label}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getStatusColor(jobLine.status || 'pending')}>
                            {statusOptions.find(opt => opt.value === (jobLine.status || 'pending'))?.label || 'Pending'}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Actions - moved to far right */}
                <div className="flex items-center space-x-4 ml-6">
                  {isEditMode && !isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditingJobLine(jobLine)}
                      className="h-8 px-2 text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {isEditMode && onJobLineDelete && !isEditing && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job Line</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this job line? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onJobLineDelete(jobLine.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Parts section - collapsible */}
            {isExpanded && jobLineParts.length > 0 && (
              <CardContent className="pt-0 border-t bg-gray-50/50">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Associated Parts ({jobLineParts.length})
                  </div>
                  
                  {jobLineParts.map((part) => {
                    const isEditingThisPart = editingPart === part.id;
                    const partTotal = (part.quantity || 0) * (part.unit_cost || 0);

                    return (
                      <div key={part.id} className="bg-white rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {isEditingThisPart ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-muted-foreground">Quantity</label>
                                    <Input
                                      type="number"
                                      step="1"
                                      value={editData.quantity || ''}
                                      onChange={(e) => setEditData({ ...editData, quantity: parseInt(e.target.value) || 0 })}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground">Unit Cost</label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editData.unit_cost || ''}
                                      onChange={(e) => setEditData({ ...editData, unit_cost: parseFloat(e.target.value) || 0 })}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">Status</label>
                                  <Select
                                    value={editData.status || 'pending'}
                                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Textarea
                                  value={editData.notes || ''}
                                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                  placeholder="Notes (optional)"
                                  rows={2}
                                  className="text-sm"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-gray-900">{part.part_name || part.part_number}</div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                  <span>Qty: {part.quantity}</span>
                                  <span>@ {formatCurrency(part.unit_cost || 0)}</span>
                                  <span className="font-medium text-gray-900">{formatCurrency(partTotal)}</span>
                                </div>
                                {part.notes && (
                                  <div className="text-sm text-muted-foreground mt-1">{part.notes}</div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            {isEditingThisPart ? (
                              <div className="flex items-center space-x-2">
                                <Button size="sm" onClick={savePartEdit} className="h-8">
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                {isEditMode ? (
                                  <Select
                                    value={part.status || 'pending'}
                                    onValueChange={(value) => onPartUpdate?.({ ...part, status: value })}
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <Badge className={getStatusColor(part.status || 'pending')}>
                                        {statusOptions.find(opt => opt.value === (part.status || 'pending'))?.label || 'Pending'}
                                      </Badge>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          <Badge className={option.color}>
                                            {option.label}
                                          </Badge>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge className={getStatusColor(part.status || 'pending')}>
                                    {statusOptions.find(opt => opt.value === (part.status || 'pending'))?.label || 'Pending'}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>

                          {/* Part Actions - moved to far right */}
                          <div className="flex items-center space-x-4 ml-6">
                            {isEditMode && !isEditingThisPart && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditingPart(part)}
                                className="h-8 px-2 text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {isEditMode && onPartDelete && !isEditingThisPart && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Part</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this part? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onPartDelete(part.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
