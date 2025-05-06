
import React, { useState } from "react";
import { TableHead } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from "lucide-react";

// Column type definition
export type ColumnId = 
  | "name" 
  | "sku" 
  | "partNumber" 
  | "barcode"
  | "category" 
  | "subcategory" 
  | "manufacturer"
  | "vehicleCompatibility"
  | "location" 
  | "quantity" 
  | "quantityReserved"
  | "quantityAvailable"
  | "onOrder"
  | "reorderPoint"
  | "cost"
  | "unitPrice" 
  | "marginMarkup"
  | "totalValue"
  | "warrantyPeriod"
  | "status"
  | "supplier" 
  | "dateBought"
  | "dateLast"
  | "notes";

export interface Column {
  id: ColumnId;
  label: string;
  visible: boolean;
}

interface SortableColumnHeaderProps {
  column: Column;
  onHideColumn?: (columnId: ColumnId) => void;
  onAddColumn?: () => void;
}

export const SortableColumnHeader = ({ 
  column, 
  onHideColumn,
  onAddColumn 
}: SortableColumnHeaderProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 999 : 1,
  };
  
  return (
    <TableHead 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`select-none cursor-grab ${isDragging ? 'bg-blue-50 shadow-md' : ''}`}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          <GripVertical className="w-4 h-4 text-gray-400 mr-1" />
          <span>{column.label}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 mt-1">
              <span className="text-xs text-gray-500">•••</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
            <DropdownMenuItem>Sort Descending</DropdownMenuItem>
            <DropdownMenuItem>Filter</DropdownMenuItem>
            <DropdownMenuSeparator />
            {onHideColumn && (
              <DropdownMenuItem onClick={() => onHideColumn(column.id)}>
                Hide Column
              </DropdownMenuItem>
            )}
            {onAddColumn && (
              <DropdownMenuItem onClick={onAddColumn}>
                <Plus className="w-4 h-4 mr-1" />
                Add Column
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableHead>
  );
};
