
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform the data to match InventoryItemExtended type
      const transformedItems: InventoryItemExtended[] = (data || []).map(item => ({
        ...item,
        price: item.unit_price, // Add the missing price property
        supplier: item.supplier || '',
        status: item.status || 'In Stock'
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

  const handleAddToCart = (item: InventoryItemExtended) => {
    const partData: WorkOrderPartFormValues = {
      inventoryItemId: item.id,
      partName: item.name,
      partNumber: item.sku,
      supplierName: item.supplier,
      supplierCost: item.unit_price,
      markupPercentage: 30,
      retailPrice: item.unit_price * 1.3,
      customerPrice: item.unit_price * 1.3,
      quantity: 1,
      partType: 'inventory',
      category: item.category,
      isStockItem: true
    };

    onAddPart(partData);
    toast.success(`${item.name} added to selected parts`);
  };

  const handleDirectSave = async (item: InventoryItemExtended) => {
    try {
      const partData: WorkOrderPartFormValues = {
        inventoryItemId: item.id,
        partName: item.name,
        partNumber: item.sku,
        supplierName: item.supplier,
        supplierCost: item.unit_price,
        markupPercentage: 30,
        retailPrice: item.unit_price * 1.3,
        customerPrice: item.unit_price * 1.3,
        quantity: 1,
        partType: 'inventory',
        category: item.category,
        isStockItem: true
      };

      await saveWorkOrderPart(workOrderId, jobLineId, partData);
      toast.success(`${item.name} added to work order`);
      onPartSaved();
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to add part to work order');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading inventory items...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
          <Package className="h-8 w-8 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-500">No inventory items found</p>
        </div>
      ) : (
        <div className="grid gap-2 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.sku}
                  </Badge>
                  <Badge 
                    variant={item.quantity > item.reorder_point ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    Stock: {item.quantity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-sm font-medium">${item.unit_price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDirectSave(item)}
                >
                  Add Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
