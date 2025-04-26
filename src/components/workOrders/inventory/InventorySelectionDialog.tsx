
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { InventoryItemExtended } from "@/types/inventory";

interface InventorySelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: InventoryItemExtended) => void;
  inventoryItems: InventoryItemExtended[];
}

export function InventorySelectionDialog({
  isOpen,
  onClose,
  onSelect,
  inventoryItems,
}: InventorySelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);

  // Filter items when search term or inventory items change
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(inventoryItems);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = inventoryItems.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.sku?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
    );
    setFilteredItems(filtered);
  }, [searchTerm, inventoryItems]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (item: InventoryItemExtended) => {
    onSelect(item);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="space-y-1 max-h-[400px] overflow-auto pr-2">
          {filteredItems.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No inventory items found
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 hover:bg-muted rounded-md transition-colors cursor-pointer"
                onClick={() => handleSelect(item)}
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground flex gap-2">
                    <span>SKU: {item.sku || 'N/A'}</span>
                    <span>•</span>
                    <span>Category: {item.category || 'None'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(item.unit_price)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} in stock
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
