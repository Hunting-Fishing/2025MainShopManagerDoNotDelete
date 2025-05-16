
import React from "react";
import { TableRow as UITableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryItemExtended } from "@/types/inventory";
import { format } from "date-fns";
import { Column } from "./SortableColumnHeader";

interface TableRowProps {
  item: InventoryItemExtended;
  visibleColumns: Column[];
  onRowClick: (itemId: string) => void;
}

export const InventoryTableRow = ({ 
  item, 
  visibleColumns, 
  onRowClick 
}: TableRowProps) => {
  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch {
      return "Invalid Date";
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const renderStatusBadge = (status: string) => {
    let color = "bg-slate-100 text-slate-800";
    
    if (status === "Out of Stock") {
      color = "bg-red-100 text-red-800 border border-red-200";
    } else if (status === "Low Stock") {
      color = "bg-yellow-100 text-yellow-800 border border-yellow-200";
    } else if (status === "In Stock") {
      color = "bg-green-100 text-green-800 border border-green-200";
    }
    
    return (
      <Badge variant="outline" className={`${color} font-medium`}>
        {status}
      </Badge>
    );
  };

  const handleClick = () => {
    onRowClick(item.id);
  };

  return (
    <UITableRow 
      onClick={handleClick}
      className="cursor-pointer hover:bg-slate-50"
    >
      {visibleColumns.map((col) => (
        <TableCell key={col.id}>
          {col.id === 'status' ? (
            renderStatusBadge(item.status)
          ) : col.id === 'reorder_point' ? (
            item.reorder_point || 0
          ) : col.id === 'quantity' ? (
            item.quantity || 0
          ) : col.id === 'unit_price' ? (
            formatPrice(item.unit_price || 0)
          ) : col.id === 'created_at' || col.id === 'updated_at' ? (
            formatDate(item[col.id as keyof InventoryItemExtended] as string)
          ) : (
            item[col.id as keyof InventoryItemExtended] || "N/A"
          )}
        </TableCell>
      ))}
    </UITableRow>
  );
};
