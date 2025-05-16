
// Add the showControls property to the component props
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
}

export function InventoryStockHeader({
  title,
  description,
  showControls = false,
  onExport,
  onImport
}: InventoryStockHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      {showControls && (
        <div className="flex items-center gap-2">
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
        </div>
      )}
    </div>
  );
}
