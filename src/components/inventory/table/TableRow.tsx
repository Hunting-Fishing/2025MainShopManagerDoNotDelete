
import React from "react";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryItemExtended } from "@/types/inventory";
import { format } from "date-fns";

export interface TableRowProps {
  item: InventoryItemExtended;
  visibleColumns: Column[];
  onRowClick?: (itemId: string) => void;
}

export interface Column {
  id: string;
  name: string;
}

export function TableRow({ item, visibleColumns, onRowClick }: TableRowProps) {
  const handleRowClick = () => {
    if (onRowClick) {
      onRowClick(item.id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const renderCellContent = (columnId: string) => {
    switch (columnId) {
      case "name":
        return item.name;
      case "sku":
        return item.sku;
      case "quantity":
        return item.quantity;
      case "reorder_point":
        return item.reorder_point;
      case "status":
        return (
          <Badge
            variant="outline"
            className={
              item.quantity === 0
                ? "bg-red-100 text-red-800 hover:bg-red-100"
                : item.quantity <= item.reorder_point
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                : "bg-green-100 text-green-800 hover:bg-green-100"
            }
          >
            {item.status}
          </Badge>
        );
      case "unit_price":
        return formatCurrency(item.unit_price);
      case "category":
        return item.category;
      case "supplier":
        return item.supplier;
      case "created_at":
      case "updated_at":
        const date = new Date(item[columnId]);
        return format(date, 'MMM d, yyyy');
      case "location":
        return item.location || "—";
      default:
        return item[columnId as keyof InventoryItemExtended] || "—";
    }
  };

  return (
    <UITableRow className="cursor-pointer" onClick={handleRowClick}>
      {visibleColumns.map((column) => (
        <TableCell key={column.id}>{renderCellContent(column.id)}</TableCell>
      ))}
    </UITableRow>
  );
}
