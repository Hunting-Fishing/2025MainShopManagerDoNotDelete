
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plus, Search } from 'lucide-react';
import { InventoryItemExtended } from '@/types/inventory';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { getInventoryItems } from '@/services/inventory';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
  onPartSaved: () => void;
}

export function InventoryPartsTab({
  workOrderId,
  jobLineId,
  onAddPart,
  onPartSaved
}: InventoryPartsTabProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const items = await getInventoryItems();
      // Transform the data to match InventoryItemExtended interface
      const transformedItems = items.map(item => ({
        ...item,
        price: item.unit_price // Map unit_price to price for compatibility
      }));
      setInventoryItems(transformedItems);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickAdd = async (item: InventoryItemExtended) => {
    const quantity = quantities[item.id] || 1;
    const markupPercentage = 25; // Default markup
    const retailPrice = item.price * (1 + markupPercentage / 100);

    const part: WorkOrderPartFormValues = {
      inventoryItemId: item.id,
      partName: item.name,
      partNumber: item.sku,
      supplierName: item.supplier,
      supplierCost: item.price,
      markupPercentage,
      retailPrice,
      customerPrice: retailPrice,
      quantity,
      partType: 'inventory' as const,
      category: item.category,
      isStockItem: true,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      status: 'ordered' as const
    };

    onAddPart(part);
    toast.success(`${item.name} added to parts list`);
  };

  const handleDirectSave = async (item: InventoryItemExtended) => {
    const quantity = quantities[item.id] || 1;
    const markupPercentage = 25; // Default markup
    const retailPrice = item.price * (1 + markupPercentage / 100);

    const part: WorkOrderPartFormValues = {
      inventoryItemId: item.id,
      partName: item.name,
      partNumber: item.sku,
      supplierName: item.supplier,
      supplierCost: item.price,
      markupPercentage,
      retailPrice,
      customerPrice: retailPrice,
      quantity,
      partType: 'inventory' as const,
      category: item.category,
      isStockItem: true,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      status: 'ordered' as const
    };

    try {
      await saveWorkOrderPart(workOrderId, jobLineId, part);
      onPartSaved();
      toast.success(`${item.name} saved to work order`);
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part');
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, quantity)
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        Loading inventory items...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="grid gap-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">{item.name}</h4>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <span>SKU: {item.sku}</span>
                  <span className="mx-2">•</span>
                  <span>Stock: {item.quantity}</span>
                  <span className="mx-2">•</span>
                  <span>Price: ${item.price.toFixed(2)}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor={`qty-${item.id}`} className="text-sm">Qty:</Label>
                  <Input
                    id={`qty-${item.id}`}
                    type="number"
                    min="1"
                    value={quantities[item.id] || 1}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 h-8"
                  />
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAdd(item)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => handleDirectSave(item)}
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No inventory items match your search.' : 'No inventory items available.'}
        </div>
      )}
    </div>
  );
}
