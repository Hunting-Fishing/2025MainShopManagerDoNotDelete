
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileSpreadsheet, Calendar } from "lucide-react";
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
          Manage and track service work orders
        </p>
        <div className="flex gap-4 mt-2">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Total:</span>{" "}
            <span className="font-medium">{total}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-yellow-600">Pending:</span>{" "}
            <span className="font-medium">{pendingCount}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-600">In Progress:</span>{" "}
            <span className="font-medium">{inProgressCount}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-green-600">Completed:</span>{" "}
            <span className="font-medium">{completedCount}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/work-orders/export">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export
          </Link>
        </Button>
        <Button asChild>
          <Link to="/work-orders/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Work Order
          </Link>
        </Button>
      </div>
    </div>
  );
};
