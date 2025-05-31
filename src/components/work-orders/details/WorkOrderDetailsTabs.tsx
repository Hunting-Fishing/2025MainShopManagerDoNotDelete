
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { TimeTracking } from "../time-tracking/TimeTracking";
import { WorkOrderInventoryItems } from "./WorkOrderInventoryItems";
import { WorkOrderDocuments } from './WorkOrderDocuments';
import { WorkOrderHistory } from './WorkOrderHistory';
import { WorkOrderNotes } from './WorkOrderNotes';
import { EditableJobLinesGrid } from '../job-lines/EditableJobLinesGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Clock, FileText, Package, History, StickyNote } from 'lucide-react';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  inventoryItems: WorkOrderInventoryItem[];
  notes: string;
  onUpdateNotes: (notes: string) => void;
  jobLines?: WorkOrderJobLine[];
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  jobLinesLoading?: boolean;
}

export function WorkOrderDetailsTabs({ 
  workOrder, 
  timeEntries, 
  onUpdateTimeEntries,
  inventoryItems,
  notes,
  onUpdateNotes,
  jobLines = [],
  onJobLinesChange,
  jobLinesLoading = false
}: WorkOrderDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("job-lines");

  return (
    <Tabs defaultValue="job-lines" value={activeTab} onValueChange={setActiveTab}>
      <div className="border-b mb-6">
        <TabsList className="bg-transparent">
          <TabsTrigger value="job-lines" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Labor & Services
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Tracking
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Parts & Inventory
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="job-lines">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Labor & Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobLinesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">Loading job lines...</div>
              </div>
            ) : (
              <EditableJobLinesGrid
                jobLines={jobLines}
                onUpdateJobLine={(updatedJobLine) => {
                  if (onJobLinesChange) {
                    const updatedJobLines = jobLines.map(line => 
                      line.id === updatedJobLine.id ? updatedJobLine : line
                    );
                    onJobLinesChange(updatedJobLines);
                  }
                }}
                onDeleteJobLine={(jobLineId) => {
                  if (onJobLinesChange) {
                    const updatedJobLines = jobLines.filter(line => line.id !== jobLineId);
                    onJobLinesChange(updatedJobLines);
                  }
                }}
                onAddJobLine={(newJobLineData) => {
                  if (onJobLinesChange) {
                    const newJobLine: WorkOrderJobLine = {
                      ...newJobLineData,
                      id: `${workOrder.id}-job-${Date.now()}`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    onJobLinesChange([...jobLines, newJobLine]);
                  }
                }}
                workOrderId={workOrder.id}
                showSummary={true}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="time">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeTracking
              workOrderId={workOrder.id}
              timeEntries={timeEntries}
              onUpdateTimeEntries={onUpdateTimeEntries}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="inventory">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Parts & Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkOrderInventoryItems 
              workOrderId={workOrder.id}
              inventoryItems={inventoryItems}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkOrderDocuments workOrderId={workOrder.id} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Activity History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkOrderHistory workOrderId={workOrder.id} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkOrderNotes 
              workOrderId={workOrder.id}
              notes={notes}
              onUpdateNotes={onUpdateNotes}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
