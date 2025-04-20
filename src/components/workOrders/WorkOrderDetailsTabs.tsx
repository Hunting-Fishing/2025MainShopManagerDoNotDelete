import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  Clock,
  Package,
  MessageSquare,
  History,
  Calendar,
  FileText
} from "lucide-react";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { WorkOrderInventoryItems } from "@/components/workOrders/details/WorkOrderInventoryItems";
import { NotesSection } from "@/components/workOrders/NotesSection";
import { WorkOrderStatusTimeline } from "@/components/workOrders/details/WorkOrderStatusTimeline";
import { TimeTrackingSection } from "@/components/workOrders/time-tracking/TimeTrackingSection";
import { WorkOrderActivitiesSection } from "@/components/workOrders/WorkOrderActivitiesSection";
import { StatusUpdateButton } from '@/components/workOrders/StatusUpdateButton';
import { WorkOrderScheduleView } from '@/components/workOrders/calendar/WorkOrderScheduleView';
import { WorkOrderAttachments } from './attachments/WorkOrderAttachments';
import { WorkOrderDocumentManager } from './documents/WorkOrderDocumentManager';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  userId?: string; 
  userName?: string;
  onStatusUpdate?: (updatedWorkOrder: WorkOrder) => void;
}

export function WorkOrderDetailsTabs({ 
  workOrder, 
  onUpdateTimeEntries,
  userId = "current-user",
  userName = "Current User",
  onStatusUpdate = () => {}
}: WorkOrderDetailsTabsProps) {
  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList className="flex h-auto flex-wrap justify-start bg-transparent p-0 w-full border-b">
        <TabsTrigger
          value="details"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Details
        </TabsTrigger>
        <TabsTrigger
          value="schedule"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </TabsTrigger>
        <TabsTrigger
          value="time"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <Clock className="h-4 w-4 mr-2" />
          Time Tracking
        </TabsTrigger>
        <TabsTrigger
          value="inventory"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <Package className="h-4 w-4 mr-2" />
          Parts & Inventory
        </TabsTrigger>
        <TabsTrigger
          value="notes"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Notes
        </TabsTrigger>
        <TabsTrigger
          value="activity"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <History className="h-4 w-4 mr-2" />
          Activity
        </TabsTrigger>
        <TabsTrigger
          value="attachments"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <FileText className="h-4 w-4 mr-2" />
          Attachments
        </TabsTrigger>
        <TabsTrigger
          value="documents"
          className="flex items-center data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
        >
          <FileText className="h-4 w-4 mr-2" />
          Documents & Signatures
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4 mt-4">
        <div className="mb-4 p-4 bg-slate-50 rounded-lg border">
          <h3 className="font-medium mb-2">Status Actions</h3>
          <div className="flex flex-wrap gap-2">
            {workOrder.status !== "in-progress" && (
              <StatusUpdateButton
                workOrder={workOrder}
                newStatus="in-progress"
                userId={userId}
                userName={userName}
                onStatusUpdate={onStatusUpdate}
              />
            )}
            
            {workOrder.status !== "completed" && (
              <StatusUpdateButton
                workOrder={workOrder}
                newStatus="completed"
                userId={userId}
                userName={userName}
                onStatusUpdate={onStatusUpdate}
              />
            )}
            
            {workOrder.status !== "cancelled" && (
              <StatusUpdateButton
                workOrder={workOrder}
                newStatus="cancelled"
                userId={userId}
                userName={userName}
                onStatusUpdate={onStatusUpdate}
              />
            )}
          </div>
        </div>
        
        <WorkOrderStatusTimeline workOrder={workOrder} />
        
        {/* Add quick view of schedule info here */}
        <WorkOrderScheduleView workOrder={workOrder} />
      </TabsContent>
      
      <TabsContent value="schedule" className="space-y-4 mt-4">
        <WorkOrderScheduleView workOrder={workOrder} />
      </TabsContent>
      
      <TabsContent value="time" className="space-y-4 mt-4">
        <TimeTrackingSection 
          workOrderId={workOrder.id} 
          timeEntries={workOrder.timeEntries || []}
          onUpdateTimeEntries={onUpdateTimeEntries}
        />
      </TabsContent>
      
      <TabsContent value="inventory" className="space-y-4 mt-4">
        <WorkOrderInventoryItems workOrder={workOrder} />
      </TabsContent>
      
      <TabsContent value="notes" className="space-y-4 mt-4">
        <NotesSection workOrder={workOrder} onNotesUpdate={onStatusUpdate} />
      </TabsContent>
      
      <TabsContent value="activity" className="space-y-4 mt-4">
        <WorkOrderActivitiesSection workOrderId={workOrder.id} />
      </TabsContent>
      
      <TabsContent value="attachments" className="space-y-4 mt-4">
        <WorkOrderAttachments workOrderId={workOrder.id} />
      </TabsContent>
      
      <TabsContent value="documents" className="space-y-4 mt-4">
        <WorkOrderDocumentManager workOrderId={workOrder.id} />
      </TabsContent>
    </Tabs>
  );
}
