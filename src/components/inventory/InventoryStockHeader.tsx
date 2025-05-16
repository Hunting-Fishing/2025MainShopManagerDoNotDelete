
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface InventoryStockHeaderProps {
  title: string;
  description?: string;
  showControls?: boolean;
  onExport?: () => void;
  onImport?: () => void;
  // Add new required props from the build errors
  lowStockCount?: number;
  outOfStockCount?: number;
  totalValue?: number;
  onRefresh?: () => Promise<void>;
}

export function InventoryStockHeader({
  title,
  description,
  showControls = false,
  onExport,
  onImport,
  lowStockCount,
  outOfStockCount,
  totalValue,
  onRefresh
}: InventoryStockHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
        
        {/* Display stats if provided */}
        {(lowStockCount !== undefined || outOfStockCount !== undefined || totalValue !== undefined) && (
          <div className="flex flex-wrap gap-4 mt-2">
            {lowStockCount !== undefined && (
              <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                {lowStockCount} Low Stock
              </span>
            )}
            
            {outOfStockCount !== undefined && outOfStockCount > 0 && (
              <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                {outOfStockCount} Out of Stock
              </span>
            )}
            
            {totalValue !== undefined && (
              <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Value: ${totalValue.toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        )}
        
        {showControls && (
          <>
            {onImport && (
              <Button variant="outline" size="sm" onClick={onImport}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            )}
            
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
            
            <Button className="ml-2" asChild>
              <Link to="/inventory/add">
                Add Item
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
