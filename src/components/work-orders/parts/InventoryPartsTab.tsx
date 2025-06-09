
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Search, Plus, Save } from 'lucide-react';
import { getInventoryItems } from '@/services/inventory';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit_price: number;
  supplier: string;
  description: string;
  location: string;
  shop_id: string;
  status: string;
  reorder_point: number;
  created_at: string;
  updated_at: string;
}

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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerPrice, setCustomerPrice] = useState<number>(0);
  const [markupPercentage, setMarkupPercentage] = useState<number>(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventoryItems();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      const calculatedPrice = selectedItem.unit_price * (1 + markupPercentage / 100);
      setCustomerPrice(calculatedPrice);
    }
  }, [selectedItem, markupPercentage]);

  const loadInventoryItems = async () => {
    try {
      const items = await getInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const createPartFormValues = (): WorkOrderPartFormValues => {
    if (!selectedItem) throw new Error('No item selected');
    
    return {
      partName: selectedItem.name,
      partNumber: selectedItem.sku,
      supplierName: selectedItem.supplier,
      supplierCost: selectedItem.unit_price,
      supplierSuggestedRetailPrice: selectedItem.unit_price,
      markupPercentage,
      retailPrice: customerPrice,
      customerPrice,
      quantity,
      partType: 'inventory' as const,
      inventoryItemId: selectedItem.id,
      category: selectedItem.category,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      status: 'ordered' as const,
      isStockItem: true,
      dateAdded: new Date().toISOString()
    };
  };

  const handleAddToList = () => {
    if (!selectedItem) {
      toast.error('Please select an inventory item');
      return;
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (quantity > selectedItem.quantity) {
      toast.error(`Only ${selectedItem.quantity} units available in stock`);
      return;
    }

    try {
      const partData = createPartFormValues();
      onAddPart(partData);
      
      // Reset form
      setSelectedItem(null);
      setQuantity(1);
      setCustomerPrice(0);
      setMarkupPercentage(50);
      setSearchTerm('');
      
      toast.success('Part added to selection list');
    } catch (error) {
      console.error('Error creating part data:', error);
      toast.error('Failed to add part');
    }
  };

  const handleSaveToWorkOrder = async () => {
    if (!selectedItem) {
      toast.error('Please select an inventory item');
      return;
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (quantity > selectedItem.quantity) {
      toast.error(`Only ${selectedItem.quantity} units available in stock`);
      return;
    }

    setSaving(true);
    try {
      const partData = createPartFormValues();
      await saveWorkOrderPart(workOrderId, jobLineId, partData);
      
      // Reset form
      setSelectedItem(null);
      setQuantity(1);
      setCustomerPrice(0);
      setMarkupPercentage(50);
      setSearchTerm('');
      
      toast.success('Part saved to work order');
      onPartSaved(); // This will close the dialog and refresh
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-muted-foreground">Loading inventory items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inventory Items List */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No inventory items found
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-colors ${
                selectedItem?.id === item.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.unit_price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {item.quantity}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Selected Item Configuration */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Configure Part: {selectedItem.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedItem.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {selectedItem.quantity}
                </p>
              </div>
              <div>
                <Label htmlFor="markup">Markup %</Label>
                <Input
                  id="markup"
                  type="number"
                  min="0"
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cost Price</Label>
                <Input value={`$${selectedItem.unit_price.toFixed(2)}`} disabled />
              </div>
              <div>
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

            <div className="flex gap-2">
              <Button
                onClick={handleAddToList}
                variant="outline"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Part
              </Button>
              <Button
                onClick={handleSaveToWorkOrder}
                disabled={saving}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Part to Work Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
