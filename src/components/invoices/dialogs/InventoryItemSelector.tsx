
import { InventoryItem } from "@/types/inventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface InventoryItemSelectorProps {
  inventoryItems: InventoryItem[];
  onSelect: (item: InventoryItem) => void;
  onClose: () => void;
  open: boolean;
}

export function InventoryItemSelector({
  inventoryItems,
  onSelect,
  onClose,
  open,
}: InventoryItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = inventoryItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.sku?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <div className="max-h-[40vh] overflow-y-auto space-y-2">
            {filteredItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No items found.
              </p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border rounded cursor-pointer hover:bg-accent flex justify-between items-center"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {item.sku} • {item.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${item.price?.toFixed(2)}</div>
                    <div className="text-sm">
                      In stock: {item.quantity || 0}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
