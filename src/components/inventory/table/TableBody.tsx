
import React from "react";
import { TableBody as UITableBody } from "@/components/ui/table";
import { InventoryTableRow } from "./TableRow";
import { InventoryItemExtended } from "@/types/inventory";
import { Column } from "./SortableColumnHeader";

interface TableBodyProps {
  items: InventoryItemExtended[];
  visibleColumns: Column[];
  onRowClick: (itemId: string) => void;
}

export const TableBody = ({ items, visibleColumns, onRowClick }: TableBodyProps) => {
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
