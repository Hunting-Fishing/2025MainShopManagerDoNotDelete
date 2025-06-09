
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { getInventoryItems } from '@/services/inventory';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  supplier_name?: string;
  cost_price?: number;
  retail_price?: number;
  quantity?: number;
}

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function InventoryPartsTab({ workOrderId, jobLineId, onAddPart }: InventoryPartsTabProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerPrice, setCustomerPrice] = useState(0);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const items = await getInventoryItems();
      console.log('Retrieved inventory items:', items);
      setInventoryItems(items || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (itemId: string) => {
    // Don't select placeholder values
    if (!itemId || itemId === '__no_items__') {
      return;
    }

    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setCustomerPrice(item.retail_price || 0);
    }
  };

  const handleAddPart = () => {
    if (!selectedItem) {
      toast.error('Please select an inventory item');
      return;
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    // Check if enough inventory is available
    if (selectedItem.quantity && quantity > selectedItem.quantity) {
      toast.error(`Only ${selectedItem.quantity} units available in inventory`);
      return;
    }

    const newPart: WorkOrderPartFormValues = {
      partName: selectedItem.name,
      partNumber: selectedItem.sku || '',
      supplierName: selectedItem.supplier_name || '',
      supplierCost: selectedItem.cost_price || 0,
      markupPercentage: selectedItem.cost_price && customerPrice 
        ? ((customerPrice - selectedItem.cost_price) / selectedItem.cost_price) * 100 
        : 0,
      retailPrice: selectedItem.retail_price || 0,
      customerPrice: customerPrice,
      quantity: quantity,
      partType: 'inventory',
      inventoryItemId: selectedItem.id
    };

    onAddPart(newPart);
    
    // Reset form
    setSelectedItem(null);
    setQuantity(1);
    setCustomerPrice(0);

    toast.success('Inventory item added successfully');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading inventory items...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Inventory Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inventoryItem">Select Inventory Item</Label>
          <Select onValueChange={handleItemSelect} value={selectedItem?.id || ''}>
            <SelectTrigger>
              <SelectValue placeholder={
                inventoryItems.length > 0 
                  ? "Select an inventory item..." 
                  : "No inventory items available"
              } />
            </SelectTrigger>
            <SelectContent>
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} {item.sku ? `(${item.sku})` : ''} - Stock: {item.quantity || 0}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-slate-500 text-sm">
                  No inventory items found. Add items in the Inventory page.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedItem && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part Number</Label>
                <Input value={selectedItem.sku || 'N/A'} disabled />
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Input value={selectedItem.supplier_name || 'N/A'} disabled />
              </div>
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input value={`$${(selectedItem.cost_price || 0).toFixed(2)}`} disabled />
              </div>
              <div className="space-y-2">
                <Label>Retail Price</Label>
                <Input value={`$${(selectedItem.retail_price || 0).toFixed(2)}`} disabled />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedItem.quantity || 999}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPrice">Customer Price</Label>
                <Input
                  id="customerPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customerPrice}
                  onChange={(e) => setCustomerPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddPart} className="bg-blue-600 hover:bg-blue-700">
                Add to Work Order
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
