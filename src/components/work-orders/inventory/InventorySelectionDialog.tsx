
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { InventoryItemExtended } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";

export interface InventorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: InventoryItemExtended) => void;
}

export const InventorySelectionDialog: React.FC<InventorySelectionDialogProps> = ({
  open,
  onOpenChange,
  onAddItem
}) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch inventory items
  useEffect(() => {
    if (open) {
      fetchInventoryItems();
    }
  }, [open]);
  
  // Filter items based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredItems(
        inventoryItems.filter(
          item => 
            item.name.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query))
        )
      );
    } else {
      setFilteredItems(inventoryItems);
    }
  }, [searchQuery, inventoryItems]);
  
  const fetchInventoryItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .filter('quantity', 'gt', 0) // Only show items in stock
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        const formattedItems = data.map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku || '',
          description: item.description || '',
          category: item.category || '',
          supplier: item.supplier || '',
          quantity: item.quantity || 0,
          reorder_point: item.reorder_point || 0,
          unit_price: item.unit_price || 0,
          price: item.unit_price || 0,
          location: item.location || '',
          status: item.status || 'In Stock'
        }));
        setInventoryItems(formattedItems);
        setFilteredItems(formattedItems);
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddItem = (item: InventoryItemExtended) => {
    onAddItem(item);
    // Don't close the dialog to allow adding multiple items
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Select Inventory Items</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items by name, SKU, or category..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">Loading inventory items...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No inventory items found
                  </TableCell>
                </TableRow>
              )}
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(item)}
                      disabled={item.quantity <= 0}
                    >
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
