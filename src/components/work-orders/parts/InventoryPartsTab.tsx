
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { InventoryItemExtended } from '@/types/inventory';
import { getInventoryItems } from '@/services/inventory/crudService';
import { SupplierSelector } from './SupplierSelector';

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
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [loading, setLoading] = useState(true);

  // Load inventory items
  useEffect(() => {
    const loadInventoryItems = async () => {
      try {
        const items = await getInventoryItems();
        setInventoryItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Failed to load inventory items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInventoryItems();
  }, []);

  // Filter items based on search query, category, and supplier
  useEffect(() => {
    let filtered = inventoryItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedSupplier) {
      filtered = filtered.filter(item => item.supplier === selectedSupplier);
    }

    setFilteredItems(filtered);
  }, [inventoryItems, searchQuery, selectedCategory, selectedSupplier]);

  const handleAddItem = (item: InventoryItemExtended, quantity: number = 1) => {
    const part: WorkOrderPartFormValues = {
      inventoryItemId: item.id,
      partName: item.name,
      partNumber: item.sku,
      supplierName: item.supplier || '',
      supplierCost: item.cost || item.unit_price || 0,
      markupPercentage: item.marginMarkup || 50,
      retailPrice: item.unit_price,
      customerPrice: item.unit_price,
      quantity: quantity,
      partType: 'inventory',
      notes: ''
    };

    onAddPart(part);
  };

  const getStockStatus = (item: InventoryItemExtended) => {
    if (item.quantity <= 0) return { label: 'Out of Stock', color: 'destructive' };
    if (item.quantity <= item.reorder_point) return { label: 'Low Stock', color: 'secondary' };
    return { label: 'In Stock', color: 'default' };
  };

  // Get unique categories and suppliers from inventory
  const categories = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];
  const suppliers = [...new Set(inventoryItems.map(item => item.supplier).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading inventory items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Search Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Input
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
                <Search className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <Label>Category</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <SupplierSelector
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
                placeholder="All Suppliers"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">No inventory items found</div>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant={stockStatus.color as any}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>SKU: {item.sku}</div>
                        <div>Category: {item.category}</div>
                        {item.supplier && <div>Supplier: {item.supplier}</div>}
                        <div>Price: ${item.unit_price.toFixed(2)} | Qty Available: {item.quantity}</div>
                        {item.description && <div>Description: {item.description}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max={item.quantity}
                        defaultValue="1"
                        className="w-20"
                        id={`qty-${item.id}`}
                      />
                      <Button 
                        onClick={() => {
                          const qtyInput = document.getElementById(`qty-${item.id}`) as HTMLInputElement;
                          const quantity = parseInt(qtyInput.value) || 1;
                          handleAddItem(item, quantity);
                        }}
                        disabled={item.quantity <= 0}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
