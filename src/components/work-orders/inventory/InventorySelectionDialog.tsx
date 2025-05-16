
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { InventoryItemExtended } from "@/types/inventory";
import { getAllInventoryItems } from "@/utils/inventory/inventoryUtils";

interface InventorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectItem: (item: InventoryItemExtended) => void;
}

export const InventorySelectionDialog: React.FC<InventorySelectionDialogProps> = ({
  open,
  onOpenChange,
  onSelectItem
}) => {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const inventoryItems = await getAllInventoryItems();
        setItems(inventoryItems);
      } catch (error) {
        console.error("Failed to fetch inventory items:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchItems();
    }
  }, [open]);
  
  const filteredItems = items.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.sku.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  });
  
  // Sort items: first show in stock items, then low stock, and finally out of stock
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.status === "Out of Stock" && b.status !== "Out of Stock") return 1;
    if (a.status !== "Out of Stock" && b.status === "Out of Stock") return -1;
    if (a.status === "Low Stock" && b.status === "In Stock") return 1;
    if (a.status === "In Stock" && b.status === "Low Stock") return -1;
    return a.name.localeCompare(b.name);
  });
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case "In Stock":
        return "border-green-300 bg-green-100 text-green-800";
      case "Low Stock":
        return "border-amber-300 bg-amber-100 text-amber-800";
      case "Out of Stock":
        return "border-red-300 bg-red-100 text-red-800";
      default:
        return "border-gray-300 bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Inventory Item</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by name, SKU, or category..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No inventory items found matching your search.
            </div>
          ) : (
            <div className="grid gap-2">
              {sortedItems.map(item => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => onSelectItem(item)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      SKU: {item.sku} | ${item.unit_price.toFixed(2)} | {item.category}
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-sm">{item.quantity} in stock</span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
