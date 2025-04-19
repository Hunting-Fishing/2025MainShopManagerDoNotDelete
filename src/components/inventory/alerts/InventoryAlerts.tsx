
import React from "react";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleAlert, Package, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export function InventoryAlerts() {
  const { loading, lowStockItems, outOfStockItems, checkInventoryAlerts } = useInventoryManager();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="bg-amber-50 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <CircleAlert className="h-5 w-5 text-amber-500" />
          <span>Inventory Alerts</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div>
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">Low Stock Items</span>
                </div>
                <div className="font-bold text-lg">{lowStockItems.length}</div>
              </div>
              {lowStockItems.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {lowStockItems.slice(0, 3).map(item => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{item.quantity} remaining</span>
                    </li>
                  ))}
                  {lowStockItems.length > 3 && (
                    <li className="text-xs text-center mt-1">
                      + {lowStockItems.length - 3} more items
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Out of Stock Items</span>
                </div>
                <div className="font-bold text-lg">{outOfStockItems.length}</div>
              </div>
              {outOfStockItems.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {outOfStockItems.slice(0, 3).map(item => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                  {outOfStockItems.length > 3 && (
                    <li className="text-xs text-center mt-1">
                      + {outOfStockItems.length - 3} more items
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-muted/20 flex justify-between p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => checkInventoryAlerts()}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="gap-1"
          onClick={() => navigate('/inventory')}
        >
          <ShoppingCart className="h-4 w-4" />
          Manage Inventory
        </Button>
      </CardFooter>
    </Card>
  );
}
