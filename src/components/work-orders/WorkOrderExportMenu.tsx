import { Download, FileText } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToExcel, exportMultiSheetExcel } from "@/utils/reportExport";
import { toast } from "@/components/ui/use-toast";
import { WorkOrder } from "@/data/workOrdersData";
import { generateWorkOrderPdf, savePdf } from "@/utils/pdf";

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
        notes: workOrder.notes || "N/A",
        totalBillableTime: workOrder.totalBillableTime 
          ? workOrder.totalBillableTime
          : "N/A"
      };
      
      // Format time entries data if they exist
      const timeEntriesData = workOrder.timeEntries ? workOrder.timeEntries.map(entry => ({
        employeeName: entry.employeeName,
        startTime: new Date(entry.startTime).toLocaleString(),
        endTime: entry.endTime ? new Date(entry.endTime).toLocaleString() : 'Ongoing',
        duration: entry.duration,
        notes: entry.notes || '',
        billable: entry.billable ? 'Yes' : 'No'
      })) : [];
      
      // Format inventory items if they exist
      const inventoryItemsData = workOrder.inventoryItems ? workOrder.inventoryItems.map(item => ({
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        total: (item.quantity * item.unitPrice).toFixed(2)
      })) : [];
      
      switch (format) {
        case "csv":
          exportToCSV([exportData], `WorkOrder_${workOrder.id}`);
          break;
        case "excel":
          // Create a workbook with multiple sheets
          const workbookData: Record<string, any[]> = {
            "Work Order": [exportData]
          };
          
          // Add time entries sheet if there are any
          if (timeEntriesData.length > 0) {
            workbookData["Time Entries"] = timeEntriesData;
          }
          
          // Add inventory items sheet if there are any
          if (inventoryItemsData.length > 0) {
            workbookData["Inventory Items"] = inventoryItemsData;
          }
          
          exportMultiSheetExcel(workbookData, `WorkOrder_${workOrder.id}`);
          break;
        case "pdf":
          // Use our enhanced PDF generator
          const doc = generateWorkOrderPdf(workOrder);
          savePdf(doc, `WorkOrder_${workOrder.id}`);
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
