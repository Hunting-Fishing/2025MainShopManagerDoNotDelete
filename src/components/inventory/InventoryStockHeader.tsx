
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileUp, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface InventoryStockHeaderProps {
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  onExport: () => void;
  onRefresh: () => void;
  onImport?: () => void;
}

export function InventoryStockHeader({
  lowStockCount,
  outOfStockCount,
  totalValue,
  onExport,
  onRefresh,
  onImport
}: InventoryStockHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Stats Cards */}
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <h3 className="text-2xl font-bold">{lowStockCount}</h3>
          </div>
          <div className="bg-amber-100 p-3 rounded-full">
            <div className="h-4 w-4 rounded-full bg-amber-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <h3 className="text-2xl font-bold">{outOfStockCount}</h3>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Inventory Value</p>
            <h3 className="text-xl font-bold">{formatCurrency(totalValue)}</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="col-span-1 md:col-span-3 flex flex-wrap gap-2 justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExport}
          className="flex items-center gap-1"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        
        {onImport && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onImport}
            className="flex items-center gap-1"
          >
            <FileUp className="h-3.5 w-3.5" />
            Import
          </Button>
        )}
      </div>
    </div>
  );
}
