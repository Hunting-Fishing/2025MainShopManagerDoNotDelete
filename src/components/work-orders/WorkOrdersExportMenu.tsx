
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/export";
import { toast } from "@/hooks/use-toast";
import { WorkOrder } from "@/data/workOrdersData";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileSpreadsheet, Files, FileText, FileJson, Download, FileX2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkOrdersExportMenuProps {
  workOrders: WorkOrder[];
}

export function WorkOrdersExportMenu({ workOrders }: WorkOrdersExportMenuProps) {
  const isMobile = useIsMobile();
  
  const handleExportAll = (format: "csv" | "excel" | "pdf" | "json") => {
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
      date: order.date,
      dueDate: order.dueDate,
      technician: order.technician,
      location: order.location || "N/A",
      billableTime: order.totalBillableTime ? `${order.totalBillableTime} minutes` : "N/A",
      serviceType: order.serviceType || order.service_type || "N/A",
      createdAt: order.createdAt || "N/A",
      notes: order.notes || "N/A",
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
      { header: "Service Type", dataKey: "serviceType" },
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
        case "json":
          // Export as JSON
          const jsonString = JSON.stringify(exportData, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "Work_Orders_List.json";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          break;
      }

      toast({
        title: "Export successful",
        description: `Work orders exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: `Failed to export as ${format.toUpperCase()}`,
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {isMobile ? "Export" : "Export All"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExportAll("csv")}>
          <Files className="mr-2 h-4 w-4 text-blue-600" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportAll("excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportAll("pdf")}>
          <FileText className="mr-2 h-4 w-4 text-red-600" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportAll("json")}>
          <FileJson className="mr-2 h-4 w-4 text-yellow-600" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={workOrders.length === 0} className="text-muted-foreground">
          <FileX2 className="mr-2 h-4 w-4" />
          {workOrders.length} work order{workOrders.length === 1 ? '' : 's'} available
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
