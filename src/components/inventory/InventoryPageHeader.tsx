import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ViewModeToggle } from "./ViewModeToggle";
import { useInventoryView } from "@/contexts/InventoryViewContext";
import { InventoryStatsCards } from "./InventoryStatsCards";
import { useInventoryData } from "@/hooks/inventory/useInventoryData";

export function InventoryPageHeader() {
  const navigate = useNavigate();
  const { toggleFilterSidebar, isFilterSidebarOpen } = useInventoryView();
  const { inventoryStats } = useInventoryData();

  const handleLowStockClick = () => {
    // Filter to show only low stock items
    console.log('Filter to low stock items');
  };

  const handleOutOfStockClick = () => {
    // Filter to show only out of stock items
    console.log('Filter to out of stock items');
  };

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage your real inventory items from the database
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={isFilterSidebarOpen ? "default" : "outline"}
            onClick={toggleFilterSidebar}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          <ViewModeToggle />
          
          <Button 
            onClick={() => navigate("/inventory/add")} 
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <InventoryStatsCards 
        stats={inventoryStats}
        onLowStockClick={handleLowStockClick}
        onOutOfStockClick={handleOutOfStockClick}
      />
    </div>
  );
}