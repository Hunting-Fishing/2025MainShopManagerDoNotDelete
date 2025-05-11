
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
        return item.partNumber || "-";
      case "barcode":
        return item.barcode || "-";
      case "category":
        return item.category;
      case "subcategory":
        return item.subcategory || "-";
      case "manufacturer":
        return item.manufacturer || "-";
      case "vehicleCompatibility":
        return item.vehicleCompatibility || "-";
      case "location":
        return item.location;
      case "quantity":
        return item.quantity;
      case "quantityReserved":
        return item.onHold || 0;
      case "quantityAvailable":
        return (item.quantity - (item.onHold || 0));
      case "onOrder":
        return item.onOrder || 0;
      case "reorderPoint":
        return item.reorderPoint;
      case "cost":
        return item.cost ? `$${item.cost.toFixed(2)}` : "-";
      case "unitPrice":
        return `$${item.unitPrice.toFixed(2)}`;
      case "marginMarkup":
        return item.marginMarkup ? `${item.marginMarkup.toFixed(2)}%` : "-";
      case "totalValue":
        return item.cost ? `$${(item.cost * item.quantity).toFixed(2)}` : "-";
      case "warrantyPeriod":
        return item.warrantyPeriod || "-";
      case "status":
        return item.status;
      case "supplier":
        return item.supplier;
      case "dateBought":
        return item.dateBought || "-";
      case "dateLast":
        return item.dateLast || "-";
      case "notes":
        return item.notes || "-";
      case "coreCharge":
        return item.coreCharge ? `$${item.coreCharge.toFixed(2)}` : "-";
      case "serialNumbers":
        return item.serialNumbers ? "Yes" : "No";
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
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/inventory/item/${item.id}`);
            }}
          >
            View
          </Button>
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
        </div>
      </TableCell>
    </UITableRow>
  );
};
