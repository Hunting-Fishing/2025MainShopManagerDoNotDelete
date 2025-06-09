
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Plus, Save } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  quantity_in_stock: number;
  description?: string;
}

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
  onPartSaved?: () => void;
}

export function InventoryPartsTab({ 
  workOrderId, 
  jobLineId, 
  onAddPart,
  onPartSaved 
}: InventoryPartsTabProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventoryItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(inventoryItems);
    }
  }, [searchTerm, inventoryItems]);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;

      const items: InventoryItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku || '',
        category: item.category || 'Uncategorized',
        unit_price: item.unit_price || 0,
        quantity_in_stock: item.quantity_in_stock || 0,
        description: item.description
      }));

      setInventoryItems(items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  const createPartFromInventoryItem = (item: InventoryItem, qty: number): WorkOrderPartFormValues => {
    return {
      inventoryItemId: item.id,
      partName: item.name,
      partNumber: item.sku,
      supplierName: '',
      supplierCost: item.unit_price,
      supplierSuggestedRetailPrice: item.unit_price,
      markupPercentage: 0,
      retailPrice: item.unit_price,
      customerPrice: item.unit_price,
      quantity: qty,
      partType: 'inventory',
      invoiceNumber: '',
      poLine: '',
      notes: item.description || '',
      category: item.category,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      installDate: '',
      installedBy: '',
      status: 'ordered',
      isStockItem: true,
      notesInternal: ''
    };
  };

  const handleAddAnotherPart = () => {
    if (!selectedItem) {
      toast.error('Please select an inventory item');
      return;
    }

    const part = createPartFromInventoryItem(selectedItem, quantity);
    onAddPart(part);
    setSelectedItem(null);
    setQuantity(1);
    toast.success('Part added to selection');
  };

  const handleSavePartToWorkOrder = async () => {
    if (!selectedItem) {
      toast.error('Please select an inventory item');
      return;
    }

    setIsSubmitting(true);
    try {
      const part = createPartFromInventoryItem(selectedItem, quantity);
      await saveWorkOrderPart(workOrderId, jobLineId, part);
      setSelectedItem(null);
      setQuantity(1);
      toast.success('Part saved to work order');
      onPartSaved?.();
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p>Loading inventory items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inventory Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className={`cursor-pointer transition-colors ${
              selectedItem?.id === item.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSelectItem(item)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>SKU: {item.sku}</div>
                  <div>Price: ${item.unit_price.toFixed(2)}</div>
                  <div className={`${item.quantity_in_stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Stock: {item.quantity_in_stock}
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No items found matching your search' : 'No inventory items available'}
          </p>
        </div>
      )}

      {/* Selected Item Details */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Name</Label>
                <p className="font-medium">{selectedItem.name}</p>
              </div>
              <div>
                <Label>SKU</Label>
                <p className="font-medium">{selectedItem.sku}</p>
              </div>
              <div>
                <Label>Unit Price</Label>
                <p className="font-medium">${selectedItem.unit_price.toFixed(2)}</p>
              </div>
              <div>
                <Label>Available Stock</Label>
                <p className="font-medium">{selectedItem.quantity_in_stock}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedItem.quantity_in_stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Total Price</Label>
                <p className="text-lg font-bold">
                  ${(selectedItem.unit_price * quantity).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddAnotherPart}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                Add Another Part
              </Button>
              
              <Button
                onClick={handleSavePartToWorkOrder}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Part to Work Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
