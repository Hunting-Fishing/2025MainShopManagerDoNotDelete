
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/reportExport";
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

    try {
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
      throw error; // Let base component handle the error
    }
  };

  return <ExportMenuBase onExport={handleExportAll} buttonText="Export All" />;
}
