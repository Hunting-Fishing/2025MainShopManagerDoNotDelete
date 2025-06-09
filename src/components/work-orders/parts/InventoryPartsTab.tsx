
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  category?: string;
  quantity?: number;
}

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function InventoryPartsTab({ workOrderId, jobLineId, onAddPart }: InventoryPartsTabProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(inventoryItems);
    }
  }, [searchTerm, inventoryItems]);

  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, sku, unit_price, category, quantity')
        .order('name');

      if (error) throw error;

      const items: InventoryItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.unit_price || 0,
        category: item.category,
        quantity: item.quantity
      }));

      setInventoryItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: InventoryItem) => {
    const quantity = quantities[item.id] || 1;
    const markupPercentage = 25; // Default markup
    const customerPrice = item.price * (1 + markupPercentage / 100);

    const part: WorkOrderPartFormValues = {
      partName: item.name,
      partNumber: item.sku,
      supplierCost: item.price,
      markupPercentage,
      retailPrice: item.price,
      customerPrice: customerPrice,
      quantity,
      partType: 'inventory',
      inventoryItemId: item.id
    };

    onAddPart(part);
    
    // Reset quantity for this item
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.max(1, quantity) }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No inventory items found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {item.sku} • Price: ${item.price.toFixed(2)}
                      {item.quantity !== undefined && (
                        <span className="ml-2">• Stock: {item.quantity}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor={`qty-${item.id}`} className="text-xs">Qty:</Label>
                      <Input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        value={quantities[item.id] || 1}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 h-8"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(item)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
