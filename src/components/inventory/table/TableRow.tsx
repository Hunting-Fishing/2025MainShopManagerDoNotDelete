
import React from "react";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { InventoryItemExtended } from "@/types/inventory";
import { Column, ColumnId } from "./SortableColumnHeader";

interface InventoryTableRowProps {
  item: InventoryItemExtended;
  visibleColumns: Column[];
  onRowClick: (itemId: string) => void;
}

export const InventoryTableRow = ({ 
  item, 
  visibleColumns, 
  onRowClick 
}: InventoryTableRowProps) => {
  const navigate = useNavigate();
  
  const getColumnValue = (item: InventoryItemExtended, columnId: ColumnId) => {
    switch (columnId) {
      case "name":
        return item.name;
      case "sku":
        return item.sku;
      case "partNumber":
        return item.partNumber;
      case "category":
        return item.category;
      case "subcategory":
        return item.subcategory;
      case "quantity":
        return item.quantity;
      case "location":
        return item.location;
      case "supplier":
        return item.supplier;
      case "unitPrice":
        return `$${item.unitPrice.toFixed(2)}`;
      case "cost":
        return item.cost ? `$${item.cost.toFixed(2)}` : "-";
      case "vehicleCompatibility":
        return item.vehicleCompatibility || "-";
      case "manufacturer":
        return item.manufacturer || "-";
      case "status":
        return item.status;
      case "warrantyPeriod":
        return item.warrantyPeriod || "-";
      case "notes":
        return item.notes || "-";
      default:
        return "-";
    }
  };

  return (
    <UITableRow 
      key={item.id} 
      className="cursor-pointer hover:bg-gray-50" 
      onClick={() => onRowClick(item.id)}
    >
      {visibleColumns.map((column) => (
        <TableCell key={`${item.id}-${column.id}`}>
          {getColumnValue(item, column.id)}
        </TableCell>
      ))}
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/inventory/item/${item.id}/edit`);
          }}
        >
          Edit
        </Button>
      </TableCell>
    </UITableRow>
  );
};
