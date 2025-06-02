
import React, { useState, useEffect } from 'react';
import { Plus, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { InventoryItemExtended } from '@/types/inventory';

interface AddInventoryDialogProps {
  workOrderId: string;
  onInventoryAdd: (item: InventoryItemExtended) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddInventoryDialog({ 
  workOrderId, 
  onInventoryAdd, 
  open, 
  onOpenChange 
}: AddInventoryDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { items: inventoryItems, isLoading } = useInventoryItems();
  
  // Filter items based on search term
  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectItem = (item: InventoryItemExtended) => {
    onInventoryAdd(item);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    // Clear search when closing
    if (!newOpen) {
      setSearchTerm('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Inventory Item
          </DialogTitle>
          <DialogDescription>
            Select an inventory item to add as a job line to this work order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Items List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" text="Loading inventory..." />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No items found matching your search.' : 'No inventory items available.'}
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.sku && (
                              <Badge variant="outline" className="text-xs">
                                {item.sku}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {item.category && (
                              <span>Category: {item.category}</span>
                            )}
                            <span>Qty: {item.quantity_in_stock || 0}</span>
                            <span className="font-medium text-green-600">
                              ${item.unit_price?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                        
                        <Button size="sm" className="ml-4">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
