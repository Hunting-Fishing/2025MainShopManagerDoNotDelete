
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrdersExportMenu } from "./WorkOrdersExportMenu";
import { WorkOrder } from "@/data/workOrdersData";

interface WorkOrdersHeaderProps {
  workOrders: WorkOrder[];
}

const WorkOrdersHeader: React.FC<WorkOrdersHeaderProps> = ({ workOrders }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Work Orders</h1>
        <p className="text-gray-500 text-sm">{workOrders.length} total work orders</p>
      </div>
      <div className="flex mt-4 sm:mt-0 space-x-3">
        <WorkOrdersExportMenu workOrders={workOrders} />
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

export default WorkOrdersHeader;
