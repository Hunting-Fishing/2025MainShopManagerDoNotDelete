
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryItemExtended } from "@/data/mockInventoryData";

interface InventoryItemCardProps {
  item: InventoryItemExtended;
  onAddItem: (item: InventoryItemExtended) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ 
  item, 
  onAddItem 
}) => {
  return (
    <div 
      key={item.id} 
      className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
      onClick={() => onAddItem(item)}
    >
      <div>
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-slate-500">
          {item.sku} - ${item.unitPrice.toFixed(2)} - {item.status}
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
