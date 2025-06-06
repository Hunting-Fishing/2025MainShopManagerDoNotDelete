
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/export";
import { toast } from "@/components/ui/use-toast";
import { Invoice } from "@/types/invoice";
import { ExportMenuBase } from "./ExportMenuBase";

interface InvoiceListExportMenuProps {
  invoices: Invoice[];
}

export function InvoiceListExportMenu({ invoices }: InvoiceListExportMenuProps) {
  const handleExportAll = (format: "csv" | "excel" | "pdf") => {
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
      workOrderId: invoice.work_order_id || "N/A",
      customer: invoice.customer,
      description: invoice.description,
      total: invoice.total ? `$${invoice.total.toFixed(2)}` : "$0.00",
      status: invoice.status,
      dueDate: invoice.due_date,
      createdBy: invoice.created_by,
    }));

    try {
      switch (format) {
        case "csv":
          exportToCSV(exportData, "Invoices_List");
          break;
        case "excel":
          exportToExcel(exportData, "Invoices_List");
          break;
        case "pdf":
          // Pass the required third argument for PDF export
          exportToPDF(exportData, "Invoices_List", {
            title: "Invoices List",
            orientation: "landscape"
          });
          break;
      }

      toast({
        title: "Export successful",
        description: `Invoices exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      throw error; // Let base component handle the error
    }
  };

  return <ExportMenuBase onExport={handleExportAll} buttonText="Export All" />;
}
