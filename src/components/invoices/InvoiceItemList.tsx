
import { InvoiceItem } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";

interface InvoiceItemListProps {
  items: InvoiceItem[];
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onPriceChange: (id: string, price: number) => void;
}

export function InvoiceItemList({
  items,
  onRemove,
  onQuantityChange,
  onDescriptionChange,
  onPriceChange,
}: InvoiceItemListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 space-y-3 bg-white dark:bg-slate-900"
        >
          <div className="flex justify-between items-start">
            <div className="font-medium">{item.name}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          
          <Textarea
            value={item.description || ""}
            onChange={(e) => onDescriptionChange(item.id, e.target.value)}
            placeholder="Description..."
            className="text-sm"
          />
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Quantity</div>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value, 10) || 1)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Price</div>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => onPriceChange(item.id, parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-medium">
                {formatCurrency(item.total || item.price * item.quantity)}
              </div>
            </div>
          </div>
          
          {item.sku && (
            <div className="text-xs text-muted-foreground">
              SKU: {item.sku}
              {item.category && ` • ${item.category}`}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
