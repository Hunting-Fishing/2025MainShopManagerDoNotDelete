
import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Download } from "lucide-react";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { Invoice } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/reportExport";
import { toast } from "@/components/ui/use-toast";

// Map of status to text and styles
export const statusMap = {
  "paid": { label: "Paid", classes: "bg-green-100 text-green-800" },
  "pending": { label: "Pending", classes: "bg-yellow-100 text-yellow-800" },
  "overdue": { label: "Overdue", classes: "bg-red-100 text-red-800" },
  "draft": { label: "Draft", classes: "bg-slate-100 text-slate-800" },
};

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const handleExportAll = (format: "csv" | "excel" | "pdf") => {
    try {
      if (invoices.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no invoices to export",
          variant: "destructive"
        });
        return;
      }

      // Prepare invoice data for export
      const exportData = invoices.map(invoice => ({
        id: invoice.id,
        workOrderId: invoice.workOrderId || "N/A",
        customer: invoice.customer,
        description: invoice.description,
        total: invoice.total ? `$${invoice.total.toFixed(2)}` : "$0.00",
        status: invoice.status,
        dueDate: invoice.dueDate,
        createdBy: invoice.createdBy,
      }));

      // Define columns for PDF export
      const columns = [
        { header: "Invoice #", dataKey: "id" },
        { header: "Work Order", dataKey: "workOrderId" },
        { header: "Customer", dataKey: "customer" },
        { header: "Description", dataKey: "description" },
        { header: "Total", dataKey: "total" },
        { header: "Status", dataKey: "status" },
        { header: "Due Date", dataKey: "dueDate" },
        { header: "Created By", dataKey: "createdBy" },
      ];

      switch (format) {
        case "csv":
          exportToCSV(exportData, "Invoices_List");
          break;
        case "excel":
          exportToExcel(exportData, "Invoices_List");
          break;
        case "pdf":
          exportToPDF(exportData, "Invoices_List", columns);
          break;
      }

      toast({
        title: "Export successful",
        description: `Invoices exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your invoices",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {invoices.length > 0 && (
        <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export All
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportAll("csv")}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll("excel")}>
                <FileText className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Work Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created By
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-sm text-slate-500">
                  <div className="flex flex-col items-center justify-center py-6">
                    <FileText className="h-12 w-12 text-slate-300" />
                    <p className="mt-2 text-slate-500">No invoices found</p>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {invoice.workOrderId && (
                      <Link to={`/work-orders/${invoice.workOrderId}`} className="text-esm-blue-600 hover:text-esm-blue-800">
                        {invoice.workOrderId}
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {invoice.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {invoice.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    ${invoice.total ? invoice.total.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {invoice.createdBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/invoices/${invoice.id}`} className="text-esm-blue-600 hover:text-esm-blue-800 mr-4">
                      View
                    </Link>
                    <Link to={`/invoices/${invoice.id}/edit`} className="text-esm-blue-600 hover:text-esm-blue-800">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
