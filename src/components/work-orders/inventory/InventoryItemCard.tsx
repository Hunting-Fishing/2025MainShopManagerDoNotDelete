
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryItemExtended } from "@/types/inventory";
import { Tag } from "lucide-react";

export interface InventoryItemCardProps {
  item: InventoryItemExtended;
  onAddItem?: (item: InventoryItemExtended) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onAddItem
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in stock":
        return "bg-green-100 text-green-800 border-green-300";
      case "low stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "out of stock":
        return "bg-red-100 text-red-800 border-red-300";
      case "discontinued":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const handleAdd = () => {
    if (onAddItem) {
      onAddItem(item);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="flex justify-between items-center p-4">
        <div className="flex flex-col">
          <div className="flex items-center">
            <h3 className="font-semibold text-base">{item.name}</h3>
            <span className="ml-2 text-sm text-gray-500">#{item.sku}</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-600">${item.unit_price.toFixed(2)}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-sm text-gray-600">
              <Tag className="h-3 w-3 inline mr-1" />
              {item.category}
            </span>
          </div>
          <div className="flex items-center mt-1 space-x-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
            <span className="text-xs">
              {item.quantity} in stock
            </span>
          </div>
        </div>
        
        {onAddItem && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAdd}
            className="h-8 px-2"
          >
            Add
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
