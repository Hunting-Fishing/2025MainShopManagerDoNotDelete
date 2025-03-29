
import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type AutoReorderSettings } from "@/hooks/inventory/useInventoryManager";
import { InventoryItemExtended } from "@/types/inventory";

interface AutoReorderStatusProps {
  items: InventoryItemExtended[];
  autoReorderSettings: Record<string, AutoReorderSettings>;
}

export function AutoReorderStatus({ items, autoReorderSettings }: AutoReorderStatusProps) {
  const itemsWithAutoReorder = items.filter(
    item => autoReorderSettings[item.id]?.enabled
  );
  
  if (itemsWithAutoReorder.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Auto-reorder Status</CardTitle>
          <CardDescription>No items configured for automatic reordering</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Auto-reorder Status</CardTitle>
        <CardDescription>Items configured for automatic reordering</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {itemsWithAutoReorder.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center">
                <div className="mr-2">
                  {item.quantity <= autoReorderSettings[item.id].threshold ? (
                    <Clock className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Threshold: {autoReorderSettings[item.id].threshold}, 
                    Reorder Qty: {autoReorderSettings[item.id].quantity}
                  </p>
                </div>
              </div>
              <div className="text-sm">
                Current: <span className={item.quantity === 0 ? "text-red-500 font-medium" : ""}>{item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
