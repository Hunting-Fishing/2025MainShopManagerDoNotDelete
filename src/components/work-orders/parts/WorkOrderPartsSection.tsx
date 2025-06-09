
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Loader2 } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';
import { AddPartsDialog } from './AddPartsDialog';
import { ViewPartDetailsDialog } from './ViewPartDetailsDialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode?: boolean;
  onPartsUpdated?: () => void;
}

export function WorkOrderPartsSection({ 
  workOrderId, 
  isEditMode = false,
  onPartsUpdated
}: WorkOrderPartsSectionProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState<WorkOrderPart | null>(null);

  const loadParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_work_order_parts', {
        work_order_id_param: workOrderId
      });

      if (error) throw error;

      // Map the data to our WorkOrderPart type
      const mappedParts: WorkOrderPart[] = (data || []).map((part: any) => ({
        id: part.id,
        workOrderId: part.work_order_id,
        jobLineId: part.job_line_id,
        inventoryItemId: part.inventory_item_id,
        partName: part.part_name,
        partNumber: part.part_number,
        supplierName: part.supplier_name,
        supplierCost: part.supplier_cost,
        supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
        markupPercentage: part.markup_percentage,
        retailPrice: part.retail_price,
        customerPrice: part.customer_price,
        quantity: part.quantity,
        partType: part.part_type as 'inventory' | 'non-inventory',
        invoiceNumber: part.invoice_number,
        poLine: part.po_line,
        notes: part.notes,
        category: part.category,
        isTaxable: part.is_taxable,
        coreChargeAmount: part.core_charge_amount,
        coreChargeApplied: part.core_charge_applied,
        warrantyDuration: part.warranty_duration,
        warrantyExpiryDate: part.warranty_expiry_date,
        installDate: part.install_date,
        installedBy: part.installed_by,
        status: part.status,
        isStockItem: part.is_stock_item,
        dateAdded: part.created_at,
        attachments: part.attachments || [],
        notesInternal: part.notes_internal,
        createdAt: part.created_at,
        updatedAt: part.updated_at
      }));

      setParts(mappedParts);
    } catch (error) {
      console.error('Error loading parts:', error);
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workOrderId) {
      loadParts();
    }
  }, [workOrderId]);

  const handlePartsAdded = () => {
    loadParts();
    if (onPartsUpdated) {
      onPartsUpdated();
    }
  };

  const handleRemovePart = async (partId: string) => {
    try {
      const { error } = await supabase.rpc('delete_work_order_part', {
        part_id_param: partId
      });

      if (error) throw error;

      toast.success('Part removed successfully');
      loadParts();
      if (onPartsUpdated) {
        onPartsUpdated();
      }
    } catch (error) {
      console.error('Error removing part:', error);
      toast.error('Failed to remove part');
    }
  };

  const totalPartsValue = parts.reduce((total, part) => total + (part.customerPrice * part.quantity), 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts ({parts.length})
            {totalPartsValue > 0 && (
              <Badge variant="secondary" className="text-green-600 bg-green-100">
                ${totalPartsValue.toFixed(2)}
              </Badge>
            )}
          </div>
          {isEditMode && (
            <AddPartsDialog
              workOrderId={workOrderId}
              onPartsAdd={handlePartsAdded}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {parts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Parts Added</h3>
            <p>Parts added to this work order will be displayed here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {parts.map((part) => (
              <div key={part.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{part.partName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {part.partType}
                      </Badge>
                      {part.supplierName && (
                        <Badge variant="secondary" className="text-xs">
                          {part.supplierName}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {part.partNumber && (
                        <div><strong>Part #:</strong> {part.partNumber}</div>
                      )}
                      <div className="flex gap-4">
                        <span><strong>Qty:</strong> {part.quantity}</span>
                        <span><strong>Price:</strong> ${part.customerPrice.toFixed(2)}</span>
                        <span className="text-green-600 font-medium">
                          <strong>Total:</strong> ${(part.quantity * part.customerPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPart(part)}
                    >
                      View Details
                    </Button>
                    {isEditMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePart(part.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {selectedPart && (
        <ViewPartDetailsDialog
          part={selectedPart}
          open={!!selectedPart}
          onOpenChange={() => setSelectedPart(null)}
        />
      )}
    </Card>
  );
}
