
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkOrdersExportMenu } from "./WorkOrdersExportMenu";
import { WorkOrder } from "@/data/workOrdersData";

interface WorkOrdersHeaderProps {
  workOrders?: WorkOrder[];
}

export default function WorkOrdersHeader({ workOrders = [] }: WorkOrdersHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row justify-between items-center'}`}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
        <p className="text-muted-foreground">
          Manage and track all work orders in your system.
        </p>
      </div>
      <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'flex-row space-x-2'}`}>
        {workOrders.length > 0 && (
          <WorkOrdersExportMenu workOrders={workOrders} />
        )}
        <Button 
          asChild 
          className={`flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700 ${isMobile ? 'w-full justify-center' : ''}`}
        >
          <Link to="/work-orders/new">
            <Plus className="h-4 w-4" />
            New Work Order
          </Link>
        </Button>
      </div>
    </div>
  );
}
