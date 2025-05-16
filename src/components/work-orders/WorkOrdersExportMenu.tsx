
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/export";
import { toast } from "@/components/ui/use-toast";
import { WorkOrder } from "@/types/workOrder";
import { ExportMenuBase } from "../invoices/ExportMenuBase";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkOrdersExportMenuProps {
  workOrders: WorkOrder[];
}

export function WorkOrdersExportMenu({ workOrders }: WorkOrdersExportMenuProps) {
  const isMobile = useIsMobile();
  
  const handleExportAll = (format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting all work orders as ${format}`);
    
    if (workOrders.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no work orders to export",
        variant: "destructive"
      });
      return;
    }

    // Prepare work order data for export
    const exportData = workOrders.map(order => ({
      id: order.id,
      customer: order.customer,
      description: order.description || "N/A",
      status: order.status,
      priority: order.priority,
      date: order.date || order.created_at || new Date().toString(),
      dueDate: order.dueDate || order.due_date || "N/A",
      technician: order.technician,
      location: order.location || "N/A",
      billableTime: order.total_billable_time ? `${order.total_billable_time} minutes` : "N/A",
    }));

    // Define columns for PDF export
    const columns = [
      { header: "ID", dataKey: "id" },
      { header: "Customer", dataKey: "customer" },
      { header: "Description", dataKey: "description" },
      { header: "Status", dataKey: "status" },
      { header: "Priority", dataKey: "priority" },
      { header: "Date", dataKey: "date" },
      { header: "Due Date", dataKey: "dueDate" },
      { header: "Technician", dataKey: "technician" },
      { header: "Location", dataKey: "location" },
      { header: "Billable Time", dataKey: "billableTime" },
    ];

    try {
      switch (format) {
        case "csv":
          exportToCSV(exportData, "Work_Orders_List");
          break;
        case "excel":
          exportToExcel(exportData, "Work_Orders_List");
          break;
        case "pdf":
          exportToPDF(exportData, "Work_Orders_List", columns);
          break;
      }

      toast({
        title: "Export successful",
        description: `Work orders exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      throw error; // Let base component handle the error
    }
  };

  return (
    <ExportMenuBase 
      onExport={handleExportAll} 
      buttonText={isMobile ? "Export" : "Export All"} 
    />
  );
}
