import React, { useState, useCallback } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { partStatusMap } from '@/types/workOrderPart';
import { EnhancedAddPartDialog } from './EnhancedAddPartDialog';
import { EditPartDialog } from './EditPartDialog';
import { DeletePartDialog } from './DeletePartDialog';
import { PartsErrorBoundary } from './PartsErrorBoundary';
import { toast } from 'sonner';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false,
  isLoading = false,
  error
}: ComprehensivePartsTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<WorkOrderPart | null>(null);
  const [deletingPart, setDeletingPart] = useState<WorkOrderPart | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  console.log('ComprehensivePartsTable render:', { 
    workOrderId, 
    partsCount: parts.length, 
    isEditMode, 
    isLoading,
    error 
  });

  const handleAddPartClick = useCallback(() => {
    try {
      console.log('Opening Add Part dialog with data:', {
        workOrderId,
        jobLinesCount: jobLines.length,
        isEditMode
      });

      if (!workOrderId) {
        toast.error('Work order ID is required to add parts');
        return;
      }

      if (!isEditMode) {
        toast.error('Work order must be in edit mode to add parts');
        return;
      }

      setOperationError(null);
      setIsAddDialogOpen(true);
    } catch (error) {
      console.error('Error opening add part dialog:', error);
      toast.error('Failed to open add part dialog');
    }
  }, [workOrderId, jobLines.length, isEditMode]);

  const handlePartAdded = useCallback(async () => {
    try {
      setIsProcessing(true);
      setOperationError(null);
      console.log('Part added successfully, refreshing parts data...');
      
      await onPartsChange();
      setIsAddDialogOpen(false);
      
      toast.success('Part added successfully');
    } catch (error) {
      console.error('Error after adding part:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh parts data';
      setOperationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onPartsChange]);

  const handleEditPart = useCallback((part: WorkOrderPart) => {
    try {
      console.log('Opening edit dialog for part:', part.id);
      setSelectedPart(part);
      setOperationError(null);
    } catch (error) {
      console.error('Error opening edit dialog:', error);
      toast.error('Failed to open edit dialog');
    }
  }, []);

  const handlePartUpdated = useCallback(async () => {
    try {
      setIsProcessing(true);
      setOperationError(null);
      
      await onPartsChange();
      setSelectedPart(null);
      
      toast.success('Part updated successfully');
    } catch (error) {
      console.error('Error after updating part:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh parts data';
      setOperationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onPartsChange]);

  const handleDeletePart = useCallback((part: WorkOrderPart) => {
    try {
      console.log('Opening delete dialog for part:', part.id);
      setDeletingPart(part);
      setOperationError(null);
    } catch (error) {
      console.error('Error opening delete dialog:', error);
      toast.error('Failed to open delete dialog');
    }
  }, []);

  const handlePartDeleted = useCallback(async () => {
    try {
      setIsProcessing(true);
      setOperationError(null);
      
      await onPartsChange();
      setDeletingPart(null);
      
      toast.success('Part deleted successfully');
    } catch (error) {
      console.error('Error after deleting part:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh parts data';
      setOperationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onPartsChange]);

  const getJobLineName = useCallback((jobLineId?: string) => {
    if (!jobLineId) return 'Unassigned';
    const jobLine = jobLines.find(jl => jl.id === jobLineId);
    return jobLine?.name || 'Unknown Job Line';
  }, [jobLines]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Error loading parts: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading parts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <PartsErrorBoundary>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Order Parts ({parts.length})</CardTitle>
            {isEditMode && (
              <Button 
                onClick={handleAddPartClick}
                size="sm"
                disabled={isProcessing || !workOrderId}
                className="gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Part
              </Button>
            )}
          </div>
          {operationError && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{operationError}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {parts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-4">No parts added to this work order yet.</div>
              {isEditMode && (
                <Button onClick={handleAddPartClick} disabled={isProcessing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Part
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Job Line</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    {isEditMode && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">
                        {part.part_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{part.name}</div>
                          {part.description && (
                            <div className="text-sm text-muted-foreground">
                              {part.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getJobLineName(part.job_line_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>{part.quantity}</TableCell>
                      <TableCell>{formatCurrency(part.unit_price)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(part.total_price)}
                      </TableCell>
                      <TableCell>
                        <Badge className={partStatusMap[part.status || 'pending']?.classes || 'bg-gray-100 text-gray-800'}>
                          {partStatusMap[part.status || 'pending']?.label || part.status}
                        </Badge>
                      </TableCell>
                      {isEditMode && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPart(part)}
                              disabled={isProcessing}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePart(part)}
                              disabled={isProcessing}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Add Part Dialog */}
      <EnhancedAddPartDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        workOrderId={workOrderId}
        jobLines={jobLines}
        onPartAdded={handlePartAdded}
      />

      {/* Edit Part Dialog */}
      {editDialogOpen && (
        <EditPartDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          part={selectedPart!}
          jobLines={jobLines}
          onSave={handlePartUpdated}
        />
      )}

      {/* Delete Part Dialog */}
      {deletingPart && (
        <DeletePartDialog
          open={!!deletingPart}
          onOpenChange={(open) => !open && setDeletingPart(null)}
          part={deletingPart}
          onPartDeleted={handlePartDeleted}
        />
      )}
    </PartsErrorBoundary>
  );
}
