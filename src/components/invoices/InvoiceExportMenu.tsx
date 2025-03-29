
import { FileText, Download } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToExcel, exportToPDF, exportMultiSheetExcel } from "@/utils/reportExport";
import { toast } from "@/components/ui/use-toast";
import { Invoice } from "@/types/invoice";

interface InvoiceExportMenuProps {
  invoice: Invoice & { 
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod?: string;
  };
}

export function InvoiceExportMenu({ invoice }: InvoiceExportMenuProps) {
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    try {
      console.log(`Exporting invoice ${invoice.id} as ${format}`);
      
      // Prepare invoice data for export
      const exportData = {
        id: invoice.id,
        customer: invoice.customer,
        description: invoice.description,
        status: invoice.status,
        date: invoice.date,
        dueDate: invoice.dueDate,
        subtotal: invoice.subtotal.toFixed(2),
        tax: invoice.tax.toFixed(2),
        total: invoice.total.toFixed(2),
        paymentMethod: invoice.paymentMethod || "N/A",
      };
      
      // Prepare items data for detailed export
      const itemsData = invoice.items.map(item => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price.toFixed(2),
        total: (item.quantity * item.price).toFixed(2),
      }));
      
      // Define columns for PDF export
      const columns = [
        { header: "ID", dataKey: "id" },
        { header: "Customer", dataKey: "customer" },
        { header: "Description", dataKey: "description" },
        { header: "Status", dataKey: "status" },
        { header: "Date", dataKey: "date" },
        { header: "Due Date", dataKey: "dueDate" },
        { header: "Subtotal", dataKey: "subtotal" },
        { header: "Tax", dataKey: "tax" },
        { header: "Total", dataKey: "total" },
        { header: "Payment Method", dataKey: "paymentMethod" },
      ];

      // Define columns for PDF export of items
      const itemColumns = [
        { header: "Item", dataKey: "name" },
        { header: "Description", dataKey: "description" },
        { header: "Quantity", dataKey: "quantity" },
        { header: "Price", dataKey: "price" },
        { header: "Total", dataKey: "total" },
      ];

      switch (format) {
        case "csv":
          exportToCSV([exportData], `Invoice_${invoice.id}`);
          break;
        case "excel":
          // Include both invoice and items data in the Excel export
          const workbookData = {
            "Invoice": [exportData],
            "Items": itemsData
          };
          exportMultiSheetExcel(workbookData, `Invoice_${invoice.id}`);
          break;
        case "pdf":
          // For PDF, we'll export the invoice details
          exportToPDF([exportData], `Invoice_${invoice.id}`, columns);
          break;
      }

      toast({
        title: "Export successful",
        description: `Invoice exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your invoice",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileText className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
