
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItemCard } from "./InventoryItemCard";
import { InventoryItemExtended } from "@/types/inventory";
import { getAllInventoryItems } from "@/services/inventoryService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch inventory items when dialog opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      getAllInventoryItems()
        .then(data => {
          setItems(data);
        })
        .catch(error => {
          console.error("Error loading inventory items:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Inventory Item</DialogTitle>
          <DialogDescription>
            Choose items from inventory to add to the work order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="max-h-[400px] overflow-y-auto mt-2">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <InventoryItemCard 
                  key={item.id} 
                  item={item} 
                  onAddItem={onAddItem} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No items match your search." : "No inventory items available."}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
