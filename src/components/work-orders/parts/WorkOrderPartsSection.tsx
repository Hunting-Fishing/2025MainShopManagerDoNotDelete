
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPart } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { InventorySectionHeader } from '../inventory/InventorySectionHeader';
import { AddInventoryDialog } from '../inventory/AddInventoryDialog';
import { SpecialOrderDialog } from './SpecialOrderDialog';
import { InventoryItem } from '@/types/inventory';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  onPartsChange: () => void;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  parts,
  onPartsChange,
  isEditMode = false
}: WorkOrderPartsSectionProps) {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showSpecialOrderDialog, setShowSpecialOrderDialog] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching inventory items:', error);
          return;
        }

        setInventoryItems(data || []);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchInventoryItems();
  }, []);

  const handleAddInventoryItem = async (item: InventoryItem) => {
    try {
      const partData = {
        work_order_id: workOrderId,
        job_line_id: null,
        part_name: item.name,
        part_number: item.sku,
        category: item.category || null,
        quantity: 1,
        customer_price: item.unit_price || item.price || 0,
        supplier_cost: 0,
        part_type: 'inventory',
        status: 'pending'
      };

      const { error } = await supabase
        .from('work_order_parts')
        .insert([partData]);

      if (error) {
        console.error('Error adding inventory item:', error);
        toast({
          title: "Error",
          description: "Failed to add inventory item",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Inventory item added successfully"
      });

      onPartsChange();
      setShowInventoryDialog(false);
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handlePartAdded = () => {
    onPartsChange();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Parts</CardTitle>
          {isEditMode && (
            <InventorySectionHeader
              onShowDialog={() => setShowInventoryDialog(true)}
              onShowSpecialOrderDialog={() => setShowSpecialOrderDialog(true)}
              totalItems={parts.length}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {parts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No parts added to this work order.
          </div>
        ) : (
          <div className="space-y-2">
            {parts.map((part) => (
              <div key={part.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{part.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {part.part_number} | Qty: {part.quantity}
                    </p>
                    {part.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {part.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${((part.unit_price || 0) * part.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AddInventoryDialog
        isOpen={showInventoryDialog}
        onClose={() => setShowInventoryDialog(false)}
        inventoryItems={inventoryItems}
        onAddItem={handleAddInventoryItem}
      />

      <SpecialOrderDialog
        isOpen={showSpecialOrderDialog}
        onClose={() => setShowSpecialOrderDialog(false)}
        workOrderId={workOrderId}
        onPartAdded={handlePartAdded}
      />
    </Card>
  );
}
