
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  PackagePlus, 
  Truck, 
  ClipboardList, 
  Plus,
  ShoppingBag,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InventorySectionHeaderProps {
  onShowDialog: () => void;
  onShowSpecialOrderDialog: () => void;
  onShowMiscItemDialog?: () => void;
  totalItems: number;
}

export function InventorySectionHeader({
  onShowDialog,
  onShowSpecialOrderDialog,
  onShowMiscItemDialog,
  totalItems
}: InventorySectionHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-slate-500" />
        <span className="font-medium">Inventory Items ({totalItems})</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Export Items</DropdownMenuItem>
            <DropdownMenuItem>Import Items</DropdownMenuItem>
            <DropdownMenuItem>Manage Categories</DropdownMenuItem>
            <DropdownMenuItem>Manage Suppliers</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onShowDialog}>
            <ShoppingBag className="h-4 w-4 mr-2" /> From Inventory
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShowSpecialOrderDialog}>
            <Truck className="h-4 w-4 mr-2" /> Special Order Item
          </DropdownMenuItem>
          {onShowMiscItemDialog && (
            <DropdownMenuItem onClick={onShowMiscItemDialog}>
              <ClipboardList className="h-4 w-4 mr-2" /> Miscellaneous Item
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
