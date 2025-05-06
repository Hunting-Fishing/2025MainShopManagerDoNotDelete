
import React from "react";
import { TableHead } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
}

export const SortableColumnHeader = ({ column }: SortableColumnHeaderProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <TableHead ref={setNodeRef} style={style} {...attributes} {...listeners} className="select-none cursor-grab">
      <div className="flex flex-col items-center">
        <span>{column.label}</span>
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
            <DropdownMenuItem>Hide Column</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableHead>
  );
};
