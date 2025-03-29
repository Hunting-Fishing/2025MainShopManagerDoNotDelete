
import { Download, FileText } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/reportExport";
import { toast } from "@/components/ui/use-toast";
import { WorkOrder } from "@/data/workOrdersData";

interface WorkOrderExportMenuProps {
  workOrder: WorkOrder;
}

export function WorkOrderExportMenu({ workOrder }: WorkOrderExportMenuProps) {
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    try {
      // Prepare data for export
      const exportData = {
        id: workOrder.id,
        customer: workOrder.customer,
        description: workOrder.description,
        status: workOrder.status,
        priority: workOrder.priority,
        date: workOrder.date,
        dueDate: workOrder.dueDate,
        technician: workOrder.technician,
        location: workOrder.location,
      };
      
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
      ];

      switch (format) {
        case "csv":
          exportToCSV([exportData], `WorkOrder_${workOrder.id}`);
          break;
        case "excel":
          exportToExcel([exportData], `WorkOrder_${workOrder.id}`);
          break;
        case "pdf":
          exportToPDF([exportData], `WorkOrder_${workOrder.id}`, columns);
          break;
      }

      toast({
        title: "Export successful",
        description: `Work order exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your work order",
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
