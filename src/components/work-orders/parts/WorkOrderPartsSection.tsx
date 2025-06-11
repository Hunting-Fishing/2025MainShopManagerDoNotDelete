
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus, DollarSign, Wrench } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { useJobLines } from '@/hooks/useJobLines';
import { AddPartsDialog } from './AddPartsDialog';
import { JobLinePartsDisplay } from './JobLinePartsDisplay';
import { PartsInventorySummary } from './PartsInventorySummary';
import { toast } from 'sonner';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  isEditMode = false
}: WorkOrderPartsSectionProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPartsDialogOpen, setAddPartsDialogOpen] = useState(false);
  const { jobLines } = useJobLines(workOrderId);

  useEffect(() => {
    loadParts();
  }, [workOrderId]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const workOrderParts = await getWorkOrderParts(workOrderId);
      setParts(workOrderParts);
    } catch (error) {
      console.error('Error loading parts:', error);
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  const handlePartsAdded = () => {
    loadParts();
    setAddPartsDialogOpen(false);
  };

  const handleRemovePart = async (partId: string) => {
    try {
      // This will be handled by the JobLinePartsDisplay component
      await loadParts();
      toast.success('Part removed successfully');
    } catch (error) {
      console.error('Error removing part:', error);
      toast.error('Failed to remove part');
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    // TODO: Implement edit functionality
    console.log('Edit part:', part);
    toast.info('Edit functionality coming soon');
  };

  // Calculate totals
  const totalPartsValue = parts.reduce((total, part) => total + (part.customerPrice * part.quantity), 0);
  const totalPartsCount = parts.reduce((total, part) => total + part.quantity, 0);
  const totalSupplierCost = parts.reduce((total, part) => total + (part.supplierCost * part.quantity), 0);
  const totalMarkup = totalPartsValue - totalSupplierCost;

  // Group parts by job line
  const partsByJobLine = parts.reduce((acc, part) => {
    const jobLineId = part.jobLineId || 'unassigned';
    if (!acc[jobLineId]) {
      acc[jobLineId] = [];
    }
    acc[jobLineId].push(part);
    return acc;
  }, {} as Record<string, WorkOrderPart[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Parts & Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">Loading parts...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Parts</p>
                <p className="text-2xl font-bold">{totalPartsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalPartsValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Cost</p>
                <p className="text-2xl font-bold">${totalSupplierCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Markup</p>
                <p className="text-2xl font-bold">${totalMarkup.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parts by Job Line */}
      <div className="space-y-4">
        {jobLines.map((jobLine) => {
          const jobLineParts = partsByJobLine[jobLine.id] || [];
          
          return (
            <Card key={jobLine.id} className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-lg">{jobLine.name}</CardTitle>
                    <Badge variant="secondary">{jobLineParts.length} parts</Badge>
                  </div>
                  {isEditMode && (
                    <Button
                      size="sm"
                      onClick={() => setAddPartsDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Parts
                    </Button>
                  )}
                </div>
                
                {jobLineParts.length > 0 && (
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>Parts: {jobLineParts.length}</span>
                    <span>Value: ${jobLineParts.reduce((sum, part) => sum + (part.customerPrice * part.quantity), 0).toFixed(2)}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {jobLineParts.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                    <Package className="h-6 w-6 mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-500 mb-2">No parts added to this job line</p>
                    {isEditMode && (
                      <p className="text-sm text-slate-400">
                        Add parts to track materials needed for this service
                      </p>
                    )}
                  </div>
                ) : (
                  <JobLinePartsDisplay 
                    parts={jobLineParts}
                    onRemovePart={handleRemovePart}
                    onEditPart={handleEditPart}
                    isEditMode={isEditMode}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Unassigned Parts */}
        {partsByJobLine.unassigned && partsByJobLine.unassigned.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-lg">Unassigned Parts</CardTitle>
                  <Badge variant="outline">{partsByJobLine.unassigned.length} parts</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <JobLinePartsDisplay 
                parts={partsByJobLine.unassigned}
                onRemovePart={handleRemovePart}
                onEditPart={handleEditPart}
                isEditMode={isEditMode}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Parts Dialog */}
      {isEditMode && (
        <AddPartsDialog
          workOrderId={workOrderId}
          onPartsAdd={handlePartsAdded}
          open={addPartsDialogOpen}
          onOpenChange={setAddPartsDialogOpen}
        />
      )}
    </div>
  );
}
