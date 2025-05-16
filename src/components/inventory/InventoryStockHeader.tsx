
import React from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Plus } from "lucide-react";

export interface InventoryStockHeaderProps {
  title: string;
  description: string;
  lowStockCount?: number;
  outOfStockCount?: number;
  totalValue?: number;
  showControls?: boolean;
  onExport?: () => void;
  onImport?: () => void;
  onRefresh?: () => Promise<void>;
}

export const InventoryStockHeader: React.FC<InventoryStockHeaderProps> = ({
  title,
  description,
  lowStockCount,
  outOfStockCount,
  totalValue,
  showControls = true,
  onExport,
  onImport,
  onRefresh
}) => {
  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
        <p className="text-gray-500">{description}</p>
        
        {/* Inventory stats - conditionally rendered if provided */}
        {(lowStockCount !== undefined || outOfStockCount !== undefined || totalValue !== undefined) && (
          <div className="flex flex-wrap gap-4 mt-2">
            {lowStockCount !== undefined && (
              <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-1">
                <span className="text-sm text-amber-700">Low Stock: <strong>{lowStockCount}</strong></span>
              </div>
            )}
            {outOfStockCount !== undefined && (
              <div className="bg-red-50 border border-red-200 rounded-md px-3 py-1">
                <span className="text-sm text-red-700">Out of Stock: <strong>{outOfStockCount}</strong></span>
              </div>
            )}
            {totalValue !== undefined && (
              <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-1">
                <span className="text-sm text-blue-700">Total Value: <strong>${totalValue.toLocaleString()}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {showControls && (
        <div className="flex gap-2 mt-4 md:mt-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={onRefresh}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              Refresh
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={onExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          {onImport && (
            <Button
              variant="outline"
              size="sm" 
              className="flex items-center gap-1"
              onClick={onImport}
            >
              <FileUp className="h-4 w-4" />
              Import
            </Button>
          )}
          <Button 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => window.location.href = "/inventory/add"}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      )}
    </div>
  );
};
