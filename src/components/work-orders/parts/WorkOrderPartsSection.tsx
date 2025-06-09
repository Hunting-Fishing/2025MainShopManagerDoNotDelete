
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Edit, Trash2, Plus } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderParts, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { AddPartsDialog } from './AddPartsDialog';
import { toast } from 'sonner';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({ workOrderId, isEditMode = false }: WorkOrderPartsSectionProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const loadParts = async () => {
    try {
      setLoading(true);
      const partsData = await getWorkOrderParts(workOrderId);
      setParts(partsData);
    } catch (error) {
      console.error('Error loading parts:', error);
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, [workOrderId]);

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part?')) {
      return;
    }

    try {
      await deleteWorkOrderPart(partId);
      await loadParts(); // Reload parts
      toast.success('Part deleted successfully');
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handlePartsAdded = () => {
    loadParts(); // Reload parts when new parts are added
    setShowAddDialog(false);
  };

  const calculatePartsTotal = () => {
    return parts.reduce((total, part) => total + (part.customerPrice * part.quantity), 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts & Components
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading parts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts & Components ({parts.length})
          </CardTitle>
          {isEditMode && (
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Parts
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {parts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No parts added to this work order</p>
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                  className="mt-2"
                >
                  Add First Part
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {parts.map((part) => (
                <div
                  key={part.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{part.partName}</h4>
                        <Badge variant="outline">{part.partType}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        {part.partNumber && (
                          <div>
                            <span className="font-medium">Part #:</span> {part.partNumber}
                          </div>
                        )}
                        {part.supplierName && (
                          <div>
                            <span className="font-medium">Supplier:</span> {part.supplierName}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Quantity:</span> {part.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Unit Price:</span> ${part.customerPrice.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Supplier Cost:</span> ${part.supplierCost.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Markup:</span> {part.markupPercentage}%
                        </div>
                        {part.invoiceNumber && (
                          <div>
                            <span className="font-medium">Invoice:</span> {part.invoiceNumber}
                          </div>
                        )}
                        {part.poLine && (
                          <div>
                            <span className="font-medium">PO Line:</span> {part.poLine}
                          </div>
                        )}
                      </div>

                      {part.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Notes:</span> {part.notes}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Added: {new Date(part.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-lg">
                          Total: ${(part.customerPrice * part.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {isEditMode && (
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePart(part.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {parts.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Parts Cost:</span>
                    <span>${calculatePartsTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddDialog && (
        <AddPartsDialog
          workOrderId={workOrderId}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onPartsAdd={handlePartsAdded}
        />
      )}
    </>
  );
}
