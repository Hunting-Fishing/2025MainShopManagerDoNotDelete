
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Plus } from 'lucide-react';
import { getInventoryItems } from '@/services/inventoryService';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { InventoryItemExtended } from '@/types/inventory';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { toast } from 'sonner';

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onPartAdded: () => void;
  onCancel: () => void;
}

export function InventoryPartsTab({
  workOrderId,
  jobLineId,
  onPartAdded,
  onCancel
}: InventoryPartsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadInventoryItems();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = inventoryItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(inventoryItems);
    }
  }, [searchQuery, inventoryItems]);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const items = await getInventoryItems();
      setInventoryItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const newSelected = new Map(selectedItems);
    if (quantity > 0) {
      newSelected.set(itemId, quantity);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleAddSelectedParts = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item');
      return;
    }

    try {
      for (const [itemId, quantity] of selectedItems.entries()) {
        const inventoryItem = inventoryItems.find(item => item.id === itemId);
        if (!inventoryItem) continue;

        const partData: WorkOrderPartFormValues = {
          partName: inventoryItem.name,
          partNumber: inventoryItem.sku,
          supplierName: inventoryItem.supplier,
          supplierCost: inventoryItem.unit_price * 0.7, // Assuming 30% markup
          markupPercentage: 30,
          retailPrice: inventoryItem.unit_price,
          customerPrice: inventoryItem.unit_price,
          quantity: quantity,
          partType: 'inventory' as const,
          inventoryItemId: inventoryItem.id,
          category: inventoryItem.category,
          isTaxable: true,
          coreChargeAmount: 0,
          coreChargeApplied: false,
          status: 'ordered' as const,
          isStockItem: true
        };

        await saveWorkOrderPart(workOrderId, partData, jobLineId);
      }

      toast.success(`Added ${selectedItems.size} parts successfully`);
      setSelectedItems(new Map());
      onPartAdded();
    } catch (error) {
      console.error('Error adding parts:', error);
      toast.error('Failed to add parts');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Inventory</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading inventory...</div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No items found matching your search' : 'No inventory items available'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant="outline">{item.sku}</Badge>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>Price: ${item.unit_price.toFixed(2)}</span>
                      <span className="ml-4">Stock: {item.quantity}</span>
                      <span className="ml-4">Location: {item.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`qty-${item.id}`} className="text-sm">Qty:</Label>
                    <Input
                      id={`qty-${item.id}`}
                      type="number"
                      min="0"
                      max={item.quantity}
                      placeholder="0"
                      className="w-20"
                      value={selectedItems.get(item.id) || ''}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleAddSelectedParts}
          disabled={selectedItems.size === 0}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Selected Parts ({selectedItems.size})
        </Button>
      </div>
    </div>
  );
}
