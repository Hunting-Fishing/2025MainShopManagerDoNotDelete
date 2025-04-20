
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileSpreadsheet, Calendar, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

interface WorkOrdersPageHeaderProps {
  total: number;
  currentCount: number;
  pendingCount?: number;
  inProgressCount?: number;
  completedCount?: number;
}

export const WorkOrdersPageHeader: React.FC<WorkOrdersPageHeaderProps> = ({
  total,
  currentCount,
  pendingCount = 0,
  inProgressCount = 0,
  completedCount = 0,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
        <p className="text-muted-foreground">
          {total} total work orders
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/work-orders/export">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export All
          </Link>
        </Button>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link to="/work-orders/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Work Order
          </Link>
        </Button>
      </div>
    </div>
  );
};
