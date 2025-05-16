
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { InventoryItemExtended } from "@/types/inventory";
import { supabase } from "@/lib/supabase";

interface InventorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: InventoryItemExtended) => void;
}

export const InventorySelectionDialog: React.FC<InventorySelectionDialogProps> = ({
  open,
  onOpenChange,
  onAddItem,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);

  // Load inventory items when the dialog opens
  useEffect(() => {
    if (open) {
      fetchInventoryItems();
    }
  }, [open]);

  const fetchInventoryItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        // Transform to match the InventoryItemExtended type
        const mappedItems = data.map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          description: item.description || "",
          price: item.unit_price, // Map unit_price to price
          unit_price: item.unit_price,
          category: item.category || "",
          supplier: item.supplier || "",
          quantity: item.quantity || 0,
          reorder_point: item.reorder_point || 0,
          status: item.status || "In Stock",
          location: item.location || "",
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
        setItems(mappedItems);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      // Fallback to empty items
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = (item: InventoryItemExtended) => {
    onAddItem(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Inventory Item</DialogTitle>
          <DialogDescription>
            Select items to add to this work order
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="overflow-auto flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading inventory items...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.quantity <= 0 ? "destructive" : item.quantity <= item.reorder_point ? "outline" : "secondary"}
                      >
                        {item.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.unit_price ? item.unit_price.toFixed(2) : "0.00"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddItem(item)}
                        disabled={item.quantity <= 0}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
