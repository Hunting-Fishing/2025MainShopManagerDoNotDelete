
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle } from "lucide-react";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function InventoryStatusCard() {
  const { lowStockItems, outOfStockItems, checkInventoryAlerts, loading } = useInventoryManager();
  const navigate = useNavigate();
  
  // Check inventory alerts on component mount
  useEffect(() => {
    checkInventoryAlerts();
  }, [checkInventoryAlerts]);

  // Calculate issue rate
  const totalAlerts = lowStockItems.length + outOfStockItems.length;
  
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Inventory Status
        </CardTitle>
        {totalAlerts > 0 && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{totalAlerts} issues</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Low Stock</span>
              <span className="font-medium">{lowStockItems.length}</span>
            </div>
            <Progress
              value={lowStockItems.length > 0 ? 100 : 0}
              className="h-2"
              indicatorClassName="bg-amber-500"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Out of Stock</span>
              <span className="font-medium">{outOfStockItems.length}</span>
            </div>
            <Progress
              value={outOfStockItems.length > 0 ? 100 : 0}
              className="h-2"
              indicatorClassName="bg-red-500"
            />
          </div>

          {totalAlerts > 0 && (
            <div className="mt-4 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/inventory')}
              >
                View Inventory
              </Button>
            </div>
          )}
          
          {!loading && totalAlerts === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-2">
              <Package className="h-8 w-8 text-green-500 mb-1" />
              <p className="text-sm font-medium text-green-600">Inventory healthy</p>
              <p className="text-xs text-muted-foreground">All items in stock</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
