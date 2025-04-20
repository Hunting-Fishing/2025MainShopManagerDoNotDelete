
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryItemExtended } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";

interface InventoryItemCardProps {
  item: InventoryItemExtended;
  onAddItem: (item: InventoryItemExtended) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ 
  item, 
  onAddItem 
}) => {
  // Map status to badge variant
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "In Stock":
        return "success";
      case "Low Stock":
        return "warning";
      case "Out of Stock":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div 
      key={item.id} 
      className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
      onClick={() => onAddItem(item)}
    >
      <div>
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-slate-500">
          {item.sku} - ${item.unitPrice.toFixed(2)}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={getBadgeVariant(item.status)}>
            {item.status}
          </Badge>
          <span className="text-xs text-slate-500">
            {item.quantity} in stock
          </span>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
