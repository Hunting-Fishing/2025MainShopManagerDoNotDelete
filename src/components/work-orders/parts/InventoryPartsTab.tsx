import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, Plus, Save } from 'lucide-react';
import { InventoryItemExtended } from '@/types/inventory';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';
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
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItemExtended | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerPrice, setCustomerPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadInventoryItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, inventoryItems]);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = inventoryItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleItemSelect = (item: InventoryItemExtended) => {
    setSelectedItem(item);
    setCustomerPrice(item.unit_price || 0);
  };

  const handleAddPart = () => {
    if (!selectedItem) return;

    const stockStatus = selectedItem.quantity >= quantity ? 'sufficient' : 'insufficient';
    
    if (stockStatus === 'insufficient') {
      toast.warning(`Only ${selectedItem.quantity} units available in stock`);
    }

    const partData: WorkOrderPartFormValues = {
      partName: selectedItem.name,
      partNumber: selectedItem.sku,
      supplierName: selectedItem.supplier || '',
      supplierCost: 0,
      markupPercentage: 0,
      retailPrice: selectedItem.unit_price || 0,
      customerPrice: customerPrice,
      quantity: quantity,
      partType: 'inventory',
      inventoryItemId: selectedItem.id,
      category: selectedItem.category,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      status: 'ordered',
      isStockItem: true
    };

    onAddPart(partData);
    resetForm();
    toast.success('Part added to selection');
  };

  const handleSavePart = async () => {
    if (!selectedItem) return;

    const stockStatus = selectedItem.quantity >= quantity ? 'sufficient' : 'insufficient';
    
    if (stockStatus === 'insufficient') {
      toast.warning(`Only ${selectedItem.quantity} units available in stock`);
    }

    const partData: WorkOrderPartFormValues = {
      partName: selectedItem.name,
      partNumber: selectedItem.sku,
      supplierName: selectedItem.supplier || '',
      supplierCost: 0,
      markupPercentage: 0,
      retailPrice: selectedItem.unit_price || 0,
      customerPrice: customerPrice,
      quantity: quantity,
      partType: 'inventory',
      inventoryItemId: selectedItem.id,
      category: selectedItem.category,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      status: 'ordered',
      isStockItem: true
    };

    setIsSaving(true);
    try {
      await saveWorkOrderPart(workOrderId, jobLineId, partData);
      resetForm();
      onPartSaved();
      toast.success('Part saved to work order');
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setQuantity(1);
    setCustomerPrice(0);
  };

  const categories = ['all', ...new Set(inventoryItems.map(item => item.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Loading inventory items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Items</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory items list */}
      <div className="max-h-64 overflow-y-auto border rounded-lg">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No inventory items found
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {filteredItems.map(item => (
              <Card 
                key={item.id} 
                className={`cursor-pointer transition-colors ${
                  selectedItem?.id === item.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => handleItemSelect(item)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-sm text-muted-foreground">
                        Price: ${item.unit_price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.quantity > 0 ? 'default' : 'destructive'}>
                        Stock: {item.quantity}
                      </Badge>
                      {item.category && (
                        <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selected item details and controls */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Selected Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item</Label>
                <p className="font-medium">{selectedItem.name}</p>
                <p className="text-sm text-muted-foreground">SKU: {selectedItem.sku}</p>
              </div>
              <div>
                <Label>Available Stock</Label>
                <p className="font-medium">{selectedItem.quantity} units</p>
              </div>
            </div>

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

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAddPart}
                variant="outline"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Part
              </Button>
              <Button
                onClick={handleSavePart}
                disabled={isSaving}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Part to Work Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
