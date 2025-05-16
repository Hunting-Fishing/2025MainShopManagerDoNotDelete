
import React from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Download, Plus } from "lucide-react";

export interface InventoryStockHeaderProps {
  title: string;
  description: string;
  showControls?: boolean;
  onExport?: () => void;
  onImport?: () => void;
}

export const InventoryStockHeader: React.FC<InventoryStockHeaderProps> = ({
  title,
  description,
  showControls = true,
  onExport,
  onImport,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>
      
      {showControls && (
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm" 
            className="flex items-center gap-1"
            onClick={onImport}
          >
            <FileUp className="h-4 w-4" />
            Import
          </Button>
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
