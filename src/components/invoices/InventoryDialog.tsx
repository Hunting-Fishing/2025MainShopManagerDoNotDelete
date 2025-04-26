
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InventoryItem } from "@/types/inventory";

interface InventoryDialogProps {
  open: boolean;
  onClose: () => void;
  inventoryItems: InventoryItem[];
  onSelectItems: (item: InventoryItem) => void;
}

export function InventoryDialog({
  open,
  onClose,
  inventoryItems,
  onSelectItems,
}: InventoryDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelect = () => {
    const items = inventoryItems.filter(item => selectedItems.includes(item.id));
    items.forEach(item => onSelectItems(item));
    setSelectedItems([]);
    onClose();
  };

  // Filter inventory items by search term
  const filteredItems = searchTerm
    ? inventoryItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : inventoryItems;

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Inventory Items</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search items by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={selectedItems.includes(item.id) ? "bg-muted" : ""}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <TableCell className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(item.id);
                      }}
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>${item.price?.toFixed(2)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={selectedItems.length === 0}>
            Add Selected ({selectedItems.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
