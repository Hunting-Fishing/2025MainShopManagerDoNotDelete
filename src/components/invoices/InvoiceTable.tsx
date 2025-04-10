
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Invoice } from "@/types/invoice";
import { Link } from "react-router-dom";
import { MoreHorizontal, Download, Copy, Printer } from "lucide-react";

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export function InvoiceTable({ invoices, isLoading = false }: InvoiceTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Apply sorting
  const sortedInvoices = [...invoices].sort((a, b) => {
    let comparison = 0;
    
    switch (sortColumn) {
      case "id":
        comparison = a.id.localeCompare(b.id);
        break;
      case "customer":
        comparison = a.customer.localeCompare(b.customer);
        break;
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "dueDate":
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case "total":
        comparison = a.total - b.total;
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });
  
  if (isLoading) {
    return (
      <div className="w-full p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (sortedInvoices.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th 
              className="px-4 py-2 text-left text-sm font-medium text-gray-500 cursor-pointer"
              onClick={() => handleSort("id")}
            >
              Invoice #
              {sortColumn === "id" && <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
            </th>
            <th 
              className="px-4 py-2 text-left text-sm font-medium text-gray-500 cursor-pointer"
              onClick={() => handleSort("customer")}
            >
              Customer
              {sortColumn === "customer" && <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
            </th>
            <th 
              className="px-4 py-2 text-left text-sm font-medium text-gray-500 cursor-pointer"
              onClick={() => handleSort("date")}
            >
              Date
              {sortColumn === "date" && <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
            </th>
            <th 
              className="px-4 py-2 text-left text-sm font-medium text-gray-500 cursor-pointer"
              onClick={() => handleSort("dueDate")}
            >
              Due Date
              {sortColumn === "dueDate" && <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
            </th>
            <th 
              className="px-4 py-2 text-left text-sm font-medium text-gray-500 cursor-pointer"
              onClick={() => handleSort("total")}
            >
              Total
              {sortColumn === "total" && <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
            </th>
            <th 
              className="px-4 py-2 text-left text-sm font-medium text-gray-500 cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Status
              {sortColumn === "status" && <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>}
            </th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sortedInvoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 text-sm font-medium">
                <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:text-blue-800">
                  #{invoice.id.substring(0, 8)}
                </Link>
              </td>
              <td className="px-4 py-4 text-sm text-gray-700">{invoice.customer}</td>
              <td className="px-4 py-4 text-sm text-gray-700">{invoice.date}</td>
              <td className="px-4 py-4 text-sm text-gray-700">{invoice.dueDate}</td>
              <td className="px-4 py-4 text-sm font-medium">${invoice.total.toFixed(2)}</td>
              <td className="px-4 py-4">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${invoice.status === "paid" ? "bg-green-100 text-green-800" : ""}
                    ${invoice.status === "pending" ? "bg-blue-100 text-blue-800" : ""}
                    ${invoice.status === "overdue" ? "bg-red-100 text-red-800" : ""}
                    ${invoice.status === "draft" ? "bg-gray-100 text-gray-800" : ""}
                    ${invoice.status === "cancelled" ? "bg-gray-100 text-gray-800" : ""}
                  `}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-4 text-right text-sm font-medium">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
