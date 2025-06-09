
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';
import { getInventoryItems } from '@/services/inventory';
import { InventoryItemExtended } from '@/types/inventory';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function InventoryPartsTab({ workOrderId, jobLineId, onAddPart }: InventoryPartsTabProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventoryItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(inventoryItems);
    }
  }, [searchTerm, inventoryItems]);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const items = await getInventoryItems();
      setInventoryItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: Math.max(0, quantity)
    }));
  };

  const handleAddItem = (item: InventoryItemExtended) => {
    const quantity = selectedItems[item.id] || 1;
    
    const partData: WorkOrderPartFormValues = {
      partName: item.name,
      partNumber: item.sku,
      supplierName: item.supplier,
      supplierCost: item.cost || item.unit_price,
      markupPercentage: 20, // Default markup
      retailPrice: item.unit_price,
      customerPrice: item.unit_price,
      quantity: quantity,
      partType: 'inventory',
      inventoryItemId: item.id
    };

    onAddPart(partData);
    
    // Reset quantity for this item
    setSelectedItems(prev => ({
      ...prev,
      [item.id]: 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading inventory items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No inventory items found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'Add some inventory items to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant="outline">{item.sku}</Badge>
                      {item.category && (
                        <Badge variant="secondary">{item.category}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Price: ${item.unit_price.toFixed(2)}</div>
                      <div>Stock: {item.quantity} available</div>
                      {item.supplier && (
                        <div>Supplier: {item.supplier}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor={`qty-${item.id}`} className="text-sm">Qty:</Label>
                      <Input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={selectedItems[item.id] || 1}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(item)}
                      disabled={item.quantity === 0}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
