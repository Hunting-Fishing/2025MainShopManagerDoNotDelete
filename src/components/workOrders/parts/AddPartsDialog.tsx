
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus } from 'lucide-react';
import { InventoryItemExtended } from '@/types/inventory';
import { useInventoryManager } from '@/hooks/inventory/useInventoryManager';
import { WorkOrderInventoryItem } from '@/types/workOrder';

interface AddPartsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemSelect: (item: InventoryItemExtended, quantity: number) => void;
  onAddItems?: (newItems: WorkOrderInventoryItem[]) => void;
}

export function AddPartsDialog({ open, onOpenChange, onItemSelect, onAddItems }: AddPartsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Get inventory items from the inventory manager
  const inventoryManager = useInventoryManager();
  const inventoryItems = inventoryManager.inventoryItems;
  
  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      setQuantities(prev => ({ ...prev, [itemId]: quantity }));
    }
  };
  
  const handleAddItem = (item: InventoryItemExtended) => {
    const quantity = quantities[item.id] || 1;
    onItemSelect(item, quantity);
    
    // If onAddItems is provided, call it with the new items
    if (onAddItems) {
      const newItem: WorkOrderInventoryItem = {
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: quantity,
        unitPrice: item.unitPrice,
        itemStatus: 'in-stock',
      };
      onAddItems([newItem]);
    }
    
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[item.id];
      return newQuantities;
    });
  };
  
  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return inventoryItems || [];
    
    const lowerQuery = searchQuery.toLowerCase();
    return (inventoryItems || []).filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.sku.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }, [inventoryItems, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Parts</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="w-20">
                    <Input
                      type="number"
                      min="1"
                      value={quantities[item.id] || 1}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddItem(item)}
                      className="p-0 h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No parts found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
