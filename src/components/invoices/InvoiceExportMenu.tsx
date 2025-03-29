
import { exportToCSV, exportToExcel, exportMultiSheetExcel } from "@/utils/reportExport";
import { toast } from "@/components/ui/use-toast";
import { Invoice } from "@/types/invoice";
import { ExportMenuBase } from "./ExportMenuBase";
import { generateInvoicePdf, savePdf } from "@/utils/pdfGeneration";

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
          // Use enhanced PDF generation
          const doc = generateInvoicePdf(invoice);
          savePdf(doc, `Invoice_${invoice.id}`);
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
