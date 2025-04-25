
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus } from 'lucide-react';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { useInventoryManager } from '@/hooks/inventory/useInventoryManager';
import { Badge } from '@/components/ui/badge';

interface AddPartsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItems: (items: WorkOrderInventoryItem[]) => void;
}

export function AddPartsDialog({ open, onOpenChange, onAddItems }: AddPartsDialogProps) {
  const { items: inventoryItems, loading } = useInventoryManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<WorkOrderInventoryItem[]>([]);

  // Reset selections when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedItems([]);
      setSearchTerm('');
      setSelectedCategory('');
    }
  }, [open]);

  // Filter items based on search and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || 
      item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for the filter dropdown
  const categories = Array.from(new Set(inventoryItems.map(item => item.category))).sort();

  const handleAddItem = (item: any) => {
    // Convert inventory item to work order inventory item
    const newItem: WorkOrderInventoryItem = {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: 1,
      unitPrice: item.unitPrice || item.unit_price,
      itemStatus: 'in-stock'
    };

    setSelectedItems(prev => [...prev, newItem]);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity = newQuantity;
    setSelectedItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  const handleConfirm = () => {
    onAddItems(selectedItems);
    onOpenChange(false);
  };

  // Check if an item has already been selected
  const isItemSelected = (id: string) => {
    return selectedItems.some(item => item.id === id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Parts & Materials</DialogTitle>
        </DialogHeader>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-[180px]">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected items */}
        {selectedItems.length > 0 && (
          <div className="mb-4 border rounded-md overflow-hidden">
            <div className="bg-muted p-2 font-medium">Selected Items</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item, index) => (
                  <TableRow key={`${item.id}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.sku}</div>
                    </TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="h-7 w-7 p-0 text-red-500"
                      >
                        ×
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Available items */}
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted p-2 font-medium">Inventory Items</div>
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading inventory items...</div>
            ) : filteredItems.length > 0 ? (
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">In Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.sku}</div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.quantity > 0 ? "outline" : "destructive"} className={
                          item.quantity > 0 ? "bg-green-100 text-green-800 border-green-300" : ""
                        }>
                          {item.quantity > 0 ? item.quantity : "Out of stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${(item.unitPrice || item.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddItem(item)}
                          disabled={isItemSelected(item.id) || item.quantity <= 0}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No matching items found.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedItems.length === 0}>
            Add {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
