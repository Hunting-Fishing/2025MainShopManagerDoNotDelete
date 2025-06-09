
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Search, Plus } from 'lucide-react';
import { WorkOrderPartFormValues, PART_STATUSES, partStatusMap } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit_price: number;
  supplier_name?: string;
  part_number?: string;
}

interface InventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function InventoryPartsTab({
  workOrderId,
  jobLineId,
  onAddPart
}: InventoryPartsTabProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('quantity', 0)
        .order('name');

      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
    } else {
      setSelectedItems(prev => new Map(prev.set(itemId, quantity)));
    }
  };

  const handleAddSelectedParts = () => {
    selectedItems.forEach((quantity, itemId) => {
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) return;

      const retailPrice = item.unit_price * 1.25; // 25% markup default
      
      const partData: WorkOrderPartFormValues = {
        partName: item.name,
        partNumber: item.part_number || item.sku,
        supplierName: item.supplier_name || '',
        supplierCost: item.unit_price,
        markupPercentage: 25,
        retailPrice: retailPrice,
        customerPrice: retailPrice,
        quantity: quantity,
        partType: 'inventory',
        inventoryItemId: item.id,
        invoiceNumber: '',
        poLine: '',
        notes: '',
        // Enhanced fields with defaults
        category: item.category || '',
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

      onAddPart(partData);
    });

    // Clear selections
    setSelectedItems(new Map());
  };

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

      {/* Selected Items Summary */}
      {selectedItems.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{selectedItems.size} item(s) selected</span>
                <span className="text-sm text-muted-foreground ml-2">
                  Total qty: {Array.from(selectedItems.values()).reduce((sum, qty) => sum + qty, 0)}
                </span>
              </div>
              <Button onClick={handleAddSelectedParts}>
                <Plus className="h-4 w-4 mr-2" />
                Add Selected Parts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <Package className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No items match your search' : 'No inventory items available'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {item.sku}
                    </Badge>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>In Stock: {item.quantity}</span>
                    <span>Price: ${item.unit_price.toFixed(2)}</span>
                    {item.supplier_name && (
                      <span>Supplier: {item.supplier_name}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`qty-${item.id}`} className="text-sm">
                    Qty:
                  </Label>
                  <Input
                    id={`qty-${item.id}`}
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={selectedItems.get(item.id) || ''}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-20"
                    placeholder="0"
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
