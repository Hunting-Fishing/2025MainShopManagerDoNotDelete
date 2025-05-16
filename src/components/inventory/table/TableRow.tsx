
import React from "react";
import { TableRow as UITableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryItemExtended } from "@/types/inventory";
import { Column } from "./SortableColumnHeader";
import { format } from "date-fns"; // Fixed missing import

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

  const renderCellValue = (col: Column) => {
    const key = col.id;
    
    if (key === 'status') {
      return renderStatusBadge(item.status);
    } 
    
    if (key === "reorder_point") {
      return item.reorder_point || 0;
    } 
    
    if (key === "quantity") {
      return item.quantity || 0;
    } 
    
    if (key === "unit_price") {
      return formatPrice(item.unit_price || 0);
    } 
    
    if (key === "created_at" || key === "updated_at") {
      // Use type assertion to access these properties
      const dateValue = item[key as keyof typeof item] as string | undefined;
      return formatDate(dateValue);
    }
    
    // Access properties using type assertion
    const value = item[key as keyof typeof item];
    return value !== undefined ? value : "N/A";
  };

  return (
    <UITableRow 
      onClick={handleClick}
      className="cursor-pointer hover:bg-slate-50"
    >
      {visibleColumns.map((col) => (
        <TableCell key={col.id}>
          {renderCellValue(col)}
        </TableCell>
      ))}
    </UITableRow>
  );
};
