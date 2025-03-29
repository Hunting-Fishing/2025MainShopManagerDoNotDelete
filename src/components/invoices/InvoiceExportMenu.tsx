
import { exportToCSV, exportToExcel, exportToPDF, exportMultiSheetExcel } from "@/utils/reportExport";
import { toast } from "@/components/ui/use-toast";
import { Invoice } from "@/types/invoice";
import { ExportMenuBase } from "./ExportMenuBase";

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

    try {
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
      throw error; // Let base component handle the error
    }
  };

  return <ExportMenuBase onExport={handleExport} buttonText="Export" />;
}
