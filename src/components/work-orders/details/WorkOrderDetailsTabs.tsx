
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Clock, History } from "lucide-react";
import { WorkOrder } from "@/data/workOrdersData";
import { TimeEntry } from "@/types/workOrder";
import { TimeTrackingSection } from "../time-tracking/TimeTrackingSection";
import { WorkOrderInformation } from "./WorkOrderInformation";
import { WorkOrderInventoryItems } from "./WorkOrderInventoryItems";
import { WorkOrderActivityHistory } from "./WorkOrderActivityHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkOrderExportMenu } from "../WorkOrderExportMenu";

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries: (timeEntries: TimeEntry[]) => void;
}

export function WorkOrderDetailsTabs({ workOrder, onUpdateTimeEntries }: WorkOrderDetailsTabsProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <div className={`flex ${isMobile ? 'justify-end' : 'justify-end'}`}>
        <WorkOrderExportMenu workOrder={workOrder} />
      </div>
      
      <Tabs defaultValue="details">
        <TabsList className={isMobile ? "w-full grid grid-cols-3" : ""}>
          <TabsTrigger value="details" className={isMobile ? "flex flex-col items-center py-2 px-1" : ""}>
            <ClipboardList className={isMobile ? "h-4 w-4 mb-1" : "mr-2 h-4 w-4"} />
            <span className={isMobile ? "text-xs" : ""}>Details</span>
          </TabsTrigger>
          <TabsTrigger value="time-tracking" className={isMobile ? "flex flex-col items-center py-2 px-1" : ""}>
            <Clock className={isMobile ? "h-4 w-4 mb-1" : "mr-2 h-4 w-4"} />
            <span className={isMobile ? "text-xs" : ""}>Time Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className={isMobile ? "flex flex-col items-center py-2 px-1" : ""}>
            <History className={isMobile ? "h-4 w-4 mb-1" : "mr-2 h-4 w-4"} />
            <span className={isMobile ? "text-xs" : ""}>Activity</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <WorkOrderInformation workOrder={workOrder} />
          <WorkOrderInventoryItems inventoryItems={workOrder.inventoryItems} />
        </TabsContent>
        
        <TabsContent value="time-tracking">
          <TimeTrackingSection 
            workOrderId={workOrder.id}
            timeEntries={workOrder.timeEntries || []}
            onUpdateTimeEntries={onUpdateTimeEntries}
          />
        </TabsContent>
        
        <TabsContent value="activity">
          <WorkOrderActivityHistory workOrderId={workOrder.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
