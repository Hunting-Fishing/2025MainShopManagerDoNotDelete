
import React from "react";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns"; // Added import for format

interface TableRowProps {
  item: any;
  columns: string[];
}

export function TableRow({ item, columns }: TableRowProps) {
  // Function to format the cell content based on the column
  const renderCellContent = (item: any, field: string) => {
    // Handle snake_case field names for database compatibility
    if (field === "reorder_point" && item["reorder_point"] !== undefined) {
      return item["reorder_point"];
    }
    
    if (field === "unit_price" && item["unit_price"] !== undefined) {
      return formatCurrency(item["unit_price"]);
    }
    
    if (field === "created_at" && item["created_at"] !== undefined) {
      return format(new Date(item["created_at"]), "MMM d, yyyy");
    }
    
    if (field === "updated_at" && item["updated_at"] !== undefined) {
      return format(new Date(item["updated_at"]), "MMM d, yyyy");
    }
    
    if (typeof item[field] === 'number') {
      return item[field];
    }

    if (typeof item[field] === 'boolean') {
      return item[field] ? 'Yes' : 'No';
    }

    return item[field] || '—';
  };

  return (
    <tr>
      {columns.map((column) => (
        <td key={column} className="py-2 px-4 border-b text-sm">
          {renderCellContent(item, column)}
        </td>
      ))}
    </tr>
  );
}

// Add this extra export for compatibility
export const InventoryTableRow = TableRow;
