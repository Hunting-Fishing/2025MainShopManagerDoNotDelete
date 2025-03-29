
import { FileText, Download } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/reportExport";
import { toast } from "@/components/ui/use-toast";
import { Invoice } from "@/types/invoice";

interface InvoiceListExportMenuProps {
  invoices: Invoice[];
}

export function InvoiceListExportMenu({ invoices }: InvoiceListExportMenuProps) {
  const handleExportAll = (format: "csv" | "excel" | "pdf") => {
    try {
      console.log(`Exporting all invoices as ${format}`);
      
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
  );
}
