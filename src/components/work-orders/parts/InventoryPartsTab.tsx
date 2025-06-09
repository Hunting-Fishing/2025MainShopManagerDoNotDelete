
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Plus, Save } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { getInventoryItems } from '@/services/inventoryService';
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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerPrice, setCustomerPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventoryItems();
  }, []);

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

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item);
    setCustomerPrice(item.unit_price || item.price || 0);
    setQuantity(1);
    setNotes('');
  };

  const createPartFormValues = (): WorkOrderPartFormValues => {
    if (!selectedItem) throw new Error('No item selected');

    return {
      workOrderId,
      jobLineId,
      inventoryItemId: selectedItem.id,
      partName: selectedItem.name,
      partNumber: selectedItem.sku,
      supplierName: selectedItem.supplier || '',
      supplierCost: 0,
      supplierSuggestedRetailPrice: 0,
      markupPercentage: 0,
      retailPrice: selectedItem.unit_price || selectedItem.price || 0,
      customerPrice,
      quantity,
      partType: 'inventory',
      notes,
      category: selectedItem.category || '',
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: null,
      installDate: null,
      installedBy: null,
      status: 'ordered',
      isStockItem: true
    };
  };

  const handleAddAnother = () => {
    if (!selectedItem) return;
    
    const partData = createPartFormValues();
    onAddPart(partData);
    
    // Reset form for adding another part
    setSelectedItem(null);
    setQuantity(1);
    setCustomerPrice(0);
    setNotes('');
    toast.success('Part added to selection');
  };

  const handleSaveToWorkOrder = async () => {
    if (!selectedItem) return;

    setSaving(true);
    try {
      const partData = createPartFormValues();
      await saveWorkOrderPart(partData);
      onPartSaved();
      toast.success('Part saved to work order');
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading inventory items...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className={`cursor-pointer transition-colors ${
                selectedItem?.id === item.id ? 'ring-2 ring-blue-500' : 'hover:bg-muted/50'
              }`}
              onClick={() => handleItemSelect(item)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">${(item.unit_price || item.price || 0).toFixed(2)}</Badge>
                      <Badge variant={item.quantity > 0 ? 'default' : 'destructive'}>
                        Stock: {item.quantity}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {selectedItem ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Add Part Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selected Item</Label>
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {selectedItem.sku}</p>
                </div>

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

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about this part..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddAnother}
                    variant="outline"
                    className="flex-1"
                    disabled={saving}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Part
                  </Button>
                  <Button 
                    onClick={handleSaveToWorkOrder}
                    className="flex-1"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Part to Work Order'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select an inventory item to add it to the work order</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
