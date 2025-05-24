
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { EquipmentWithMaintenance } from "@/services/equipmentService";
import { CalendarDays, Plus, Settings } from "lucide-react";
import { SchedulerEquipmentList } from "./scheduler/SchedulerEquipmentList";
import { SchedulerSettingsPanel } from "./scheduler/SchedulerSettingsPanel";

interface MaintenanceSchedulerProps {
  equipmentList: EquipmentWithMaintenance[];
}

export function MaintenanceScheduler({ equipmentList }: MaintenanceSchedulerProps) {
  const [activeTab, setActiveTab] = useState<"equipment" | "settings">("equipment");
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);

  const handleAddSchedule = () => {
    setShowNewScheduleModal(true);
  };

  return (
    <Card>
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center text-lg">
            <CalendarDays className="mr-2 h-5 w-5 text-muted-foreground" />
            Maintenance Scheduler
          </CardTitle>
          <div className="flex items-center">
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleAddSchedule}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Schedule
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <div className="border-b px-4">
            <TabsList className="bg-transparent border-b-0 mb-0">
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-1" />
                Schedule Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-4">
            <TabsContent value="equipment" className="mt-0">
              <SchedulerEquipmentList equipmentList={equipmentList} />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <SchedulerSettingsPanel />
            </TabsContent>
          </div>
        </Tabs>
        
        {/* This would be where the NewScheduleModal would be rendered when showNewScheduleModal is true */}
        {/* Will need to implement the actual modal component separately */}
      </CardContent>
    </Card>
  );
}
