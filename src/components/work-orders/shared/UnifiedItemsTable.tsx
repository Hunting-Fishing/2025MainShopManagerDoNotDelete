
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Edit } from 'lucide-react';
import { jobLineStatusMap, partStatusMap } from '@/types/jobLine';

export interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  onReorderJobLines?: (reorderedJobLines: WorkOrderJobLine[]) => void;
  onReorderParts?: (reorderedParts: WorkOrderPart[]) => void;
  isEditMode: boolean;
  showType: "all" | "labor" | "parts" | "overview";
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
  showType,
}: UnifiedItemsTableProps) {
  const [editingJobLine, setEditingJobLine] = useState<string | null>(null);
  const [editingPart, setEditingPart] = useState<string | null>(null);

  const displayJobLines = showType === "parts" ? [] : jobLines;
  const displayParts = showType === "labor" ? [] : allParts;

  const calculateJobLineTotal = (jobLine: WorkOrderJobLine) => {
    const hours = jobLine.estimated_hours || 0;
    const rate = jobLine.labor_rate || 0;
    return hours * rate;
  };

  const calculatePartTotal = (part: WorkOrderPart) => {
    const quantity = part.quantity || 0;
    const unitPrice = part.unit_price || 0;
    return quantity * unitPrice;
  };

  const handleJobLineStatusChange = (jobLineId: string, newStatus: string) => {
    if (onJobLineUpdate) {
      const jobLine = jobLines.find(jl => jl.id === jobLineId);
      if (jobLine) {
        onJobLineUpdate({ ...jobLine, status: newStatus });
      }
    }
  };

  const handlePartStatusChange = (partId: string, newStatus: string) => {
    if (onPartUpdate) {
      const part = allParts.find(p => p.id === partId);
      if (part) {
        onPartUpdate({ ...part, status: newStatus });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (displayJobLines.length === 0 && displayParts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {showType === "labor" && "No job lines added yet"}
        {showType === "parts" && "No parts added yet"}
        {(showType === "all" || showType === "overview") && "No items added yet"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Lines */}
      {displayJobLines.map((jobLine) => (
        <Card key={jobLine.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="font-medium text-sm">{jobLine.name}</div>
                  <div className="text-xs text-muted-foreground">{jobLine.category}</div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Hours: </span>
                  <span className="font-medium">{jobLine.estimated_hours || 0}</span>
                  <div className="text-xs text-muted-foreground">
                    @ {formatCurrency(jobLine.labor_rate || 0)}/hr
                  </div>
                </div>

                <div className="flex items-center">
                  {isEditMode ? (
                    <Select 
                      value={jobLine.status || 'pending'} 
                      onValueChange={(value) => handleJobLineStatusChange(jobLine.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(jobLineStatusMap).map(([key, status]) => (
                          <SelectItem key={key} value={key}>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.classes}`}>
                              {status.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge 
                      variant="secondary" 
                      className={jobLineStatusMap[jobLine.status as keyof typeof jobLineStatusMap]?.classes || 'bg-gray-100 text-gray-800'}
                    >
                      {jobLineStatusMap[jobLine.status as keyof typeof jobLineStatusMap]?.label || jobLine.status}
                    </Badge>
                  )}
                </div>

                <div className="text-sm font-medium">
                  {formatCurrency(calculateJobLineTotal(jobLine))}
                </div>
              </div>

              {isEditMode && (
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingJobLine(jobLine.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <div className="ml-6">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job Line</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{jobLine.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onJobLineDelete?.(jobLine.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Parts */}
      {displayParts.map((part) => (
        <Card key={part.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="font-medium text-sm">{part.name || part.partName}</div>
                  <div className="text-xs text-muted-foreground">#{part.part_number}</div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Qty: </span>
                  <span className="font-medium">{part.quantity}</span>
                  <div className="text-xs text-muted-foreground">
                    @ {formatCurrency(part.unit_price || 0)} each
                  </div>
                </div>

                <div className="flex items-center">
                  {isEditMode ? (
                    <Select 
                      value={part.status || 'pending'} 
                      onValueChange={(value) => handlePartStatusChange(part.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(partStatusMap).map(([key, status]) => (
                          <SelectItem key={key} value={key}>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.classes}`}>
                              {status.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge 
                      variant="secondary" 
                      className={partStatusMap[part.status as keyof typeof partStatusMap]?.classes || 'bg-gray-100 text-gray-800'}
                    >
                      {partStatusMap[part.status as keyof typeof partStatusMap]?.label || part.status}
                    </Badge>
                  )}
                </div>

                <div className="text-sm font-medium">
                  {formatCurrency(calculatePartTotal(part))}
                </div>
              </div>

              {isEditMode && (
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPart(part.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <div className="ml-6">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Part</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{part.name || part.partName}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onPartDelete?.(part.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
