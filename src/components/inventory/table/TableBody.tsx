
import React from "react";
import { TableBody as UITableBody, TableCell, TableRow } from "@/components/ui/table";
import { InventoryTableRow } from "./TableRow";
import { InventoryItemExtended } from "@/types/inventory";
import { Column } from "./SortableColumnHeader";

interface TableBodyProps {
  items: InventoryItemExtended[];
  visibleColumns: Column[];
  onRowClick: (itemId: string) => void;
}

export const TableBody = ({ 
  items, 
  visibleColumns, 
  onRowClick 
}: TableBodyProps) => {
  if (items.length === 0) {
    return (
      <UITableBody>
        <TableRow>
          <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center">
            No inventory items found
          </TableCell>
        </TableRow>
      </UITableBody>
    );
  }
  
  return (
    <UITableBody>
      {items.map((item) => (
        <InventoryTableRow 
          key={item.id} 
          item={item} 
          visibleColumns={visibleColumns} 
          onRowClick={onRowClick} 
        />
      ))}
    </UITableBody>
  );
};
