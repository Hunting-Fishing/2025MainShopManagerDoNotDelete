import React from "react";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns"; // Add this import

interface TableRowProps {
  item: any;
  columns: string[];
}

export function TableRow({ item, columns }: TableRowProps) {
  // Function to format the cell content based on the column
  const renderCellContent = (item: any, field: string) => {
    if (field === "reorderPoint" && item["reorder_point"] !== undefined) {
      return item["reorder_point"];
    }
    
    if (field === "unitPrice" && item["unit_price"] !== undefined) {
      return formatCurrency(item["unit_price"]);
    }
    
    if (field === "createdAt" && item["created_at"] !== undefined) {
      return format(new Date(item["created_at"]), "MMM d, yyyy");
    }
    
    if (field === "updatedAt" && item["updated_at"] !== undefined) {
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
