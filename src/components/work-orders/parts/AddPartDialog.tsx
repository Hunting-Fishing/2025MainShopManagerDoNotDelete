
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItemExtended } from '@/types/inventory';
import { WorkOrderPart } from '@/types/workOrderPart';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLineId?: string;
  onPartAdded: () => void;
}

export function AddPartDialog({
  open,
  onOpenChange,
  workOrderId,
  jobLineId,
  onPartAdded
}: AddPartDialogProps) {
  const [selectedTab, setSelectedTab] = useState<'inventory' | 'non-inventory'>('inventory');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItemExtended | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Non-inventory part form data
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [description, setDescription] = useState('');

  const { items: inventoryItems, isLoading: loadingInventory } = useInventoryItems();

  const handleInventoryPartAdd = async () => {
    if (!selectedInventoryItem) {
      toast({
        title: "Error",
        description: "Please select an inventory item",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const partData: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'> = {
        work_order_id: workOrderId,
        job_line_id: jobLineId,
        part_number: selectedInventoryItem.sku,
        name: selectedInventoryItem.name,
        description: selectedInventoryItem.description || '',
        quantity,
        unit_price: selectedInventoryItem.unit_price || selectedInventoryItem.price,
        total_price: (selectedInventoryItem.unit_price || selectedInventoryItem.price) * quantity,
        status: 'pending',
        notes,
        category: selectedInventoryItem.category,
        supplierName: selectedInventoryItem.supplier,
        customerPrice: selectedInventoryItem.unit_price || selectedInventoryItem.price,
        isStockItem: true,
        inventoryItemId: selectedInventoryItem.id
      };

      await createWorkOrderPart(partData);
      
      toast({
        title: "Success",
        description: "Inventory part added successfully",
      });
      
      onPartAdded();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error adding inventory part:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory part",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNonInventoryPartAdd = async () => {
    if (!partName || !partNumber || unitPrice <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const partData: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'> = {
        work_order_id: workOrderId,
        job_line_id: jobLineId,
        part_number: partNumber,
        name: partName,
        description,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        status: 'pending',
        notes,
        isStockItem: false
      };

      await createWorkOrderPart(partData);
      
      toast({
        title: "Success",
        description: "Non-inventory part added successfully",
      });
      
      onPartAdded();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error adding non-inventory part:', error);
      toast({
        title: "Error",
        description: "Failed to add non-inventory part",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedInventoryItem(null);
    setQuantity(1);
    setNotes('');
    setPartName('');
    setPartNumber('');
    setUnitPrice(0);
    setDescription('');
    setSelectedTab('inventory');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Part to Work Order</DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'inventory' | 'non-inventory')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">From Inventory</TabsTrigger>
            <TabsTrigger value="non-inventory">Non-Inventory Part</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="inventory-item">Select Inventory Item</Label>
                <Select
                  value={selectedInventoryItem?.id || ''}
                  onValueChange={(value) => {
                    const item = inventoryItems.find(item => item.id === value);
                    setSelectedInventoryItem(item || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an inventory item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingInventory ? (
                      <SelectItem value="loading" disabled>Loading inventory...</SelectItem>
                    ) : (
                      inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.sku}) - ${item.unit_price || item.price}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedInventoryItem && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium">{selectedInventoryItem.name}</h4>
                  <p className="text-sm text-muted-foreground">SKU: {selectedInventoryItem.sku}</p>
                  <p className="text-sm text-muted-foreground">Price: ${selectedInventoryItem.unit_price || selectedInventoryItem.price}</p>
                  {selectedInventoryItem.description && (
                    <p className="text-sm text-muted-foreground">{selectedInventoryItem.description}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this part..."
                />
              </div>

              <Button 
                onClick={handleInventoryPartAdd} 
                disabled={!selectedInventoryItem || isLoading}
                className="w-full"
              >
                {isLoading ? 'Adding...' : 'Add Inventory Part'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="non-inventory" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="part-name">Part Name *</Label>
                <Input
                  id="part-name"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="Enter part name..."
                />
              </div>

              <div>
                <Label htmlFor="part-number">Part Number *</Label>
                <Input
                  id="part-number"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  placeholder="Enter part number..."
                />
              </div>

              <div>
                <Label htmlFor="unit-price">Unit Price *</Label>
                <Input
                  id="unit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="non-inv-quantity">Quantity</Label>
                <Input
                  id="non-inv-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Part description..."
                />
              </div>

              <div>
                <Label htmlFor="non-inv-notes">Notes (Optional)</Label>
                <Textarea
                  id="non-inv-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this part..."
                />
              </div>

              <Button 
                onClick={handleNonInventoryPartAdd} 
                disabled={!partName || !partNumber || unitPrice <= 0 || isLoading}
                className="w-full"
              >
                {isLoading ? 'Adding...' : 'Add Non-Inventory Part'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
