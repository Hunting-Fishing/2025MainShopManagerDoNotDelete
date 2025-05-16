
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

export interface InventoryStockHeaderProps {
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  onExport: () => void;
  onRefresh: () => void;
  title?: string;
  description?: string;
}

export function InventoryStockHeader({ 
  lowStockCount, 
  outOfStockCount, 
  totalValue, 
  onExport,
  onRefresh,
  title = "Inventory Overview",
  description = "Track your inventory levels and stock value"
}: InventoryStockHeaderProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-500">{description}</p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Total Value</div>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Low Stock Items</div>
            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Out of Stock Items</div>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
