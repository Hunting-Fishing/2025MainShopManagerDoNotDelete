
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface WorkOrdersPageHeaderProps {
  total: number;
  currentCount: number;
}

export const WorkOrdersPageHeader: React.FC<WorkOrdersPageHeaderProps> = ({
  total,
  currentCount
}) => {
  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting work orders as ${format}...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Work orders have been exported as ${format}`,
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 className="text-2xl font-bold">Work Orders</h1>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-slate-600">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('CSV')}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('PDF')}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('Print')}>
              Print Work Orders
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link to="/work-orders/new">
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Link>
        </Button>
      </div>
    </div>
  );
};
