
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, parseISO, isBefore } from "date-fns";
import { equipment, getOverdueMaintenanceEquipment } from "@/data/equipmentData";
import { MaintenanceHeader } from "@/components/maintenance/MaintenanceHeader";
import { MaintenanceAlerts } from "@/components/maintenance/MaintenanceAlerts";
import { UpcomingMaintenanceTable } from "@/components/maintenance/UpcomingMaintenanceTable";
import { MaintenanceHistoryTable } from "@/components/maintenance/MaintenanceHistoryTable";
import { MaintenanceScheduler } from "@/components/maintenance/MaintenanceScheduler";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { getUpcomingMaintenanceSchedules } from "@/utils/maintenanceScheduler";
import { Equipment, MaintenanceRecord } from "@/types/equipment";

export default function MaintenanceDashboard() {
  const [timeframe, setTimeframe] = useState<"upcoming" | "all">("upcoming");
  const [filterStatus, setFilterStatus] = useState<"all" | "overdue" | "scheduled">("all");
  
  // Get equipment requiring maintenance
  const overdueEquipment = getOverdueMaintenanceEquipment();
  
  // Get upcoming maintenance schedules (next 30 days)
  const upcomingMaintenance = getUpcomingMaintenanceSchedules(equipment, 30);
  
  // Collect all maintenance history from all equipment
  const allMaintenanceHistory: Array<MaintenanceRecord & { equipmentName: string }> = [];
  equipment.forEach(item => {
    if (item.maintenanceHistory) {
      item.maintenanceHistory.forEach(record => {
        allMaintenanceHistory.push({
          ...record,
          equipmentName: item.name
        });
      });
    }
  });
  
  // Sort maintenance history by date (most recent first)
  const sortedMaintenanceHistory = [...allMaintenanceHistory].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Calculate maintenance statistics
  const today = new Date();
  const totalScheduled = equipment.reduce((count, item) => 
    count + (item.maintenanceSchedules?.length || 0), 0);
  
  const totalOverdue = overdueEquipment.length;
  
  const upcomingCount = upcomingMaintenance.length;
  
  const completedCount = allMaintenanceHistory.filter(record => 
    new Date(record.date).getTime() > today.getTime() - (30 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <MaintenanceHeader 
        totalScheduled={totalScheduled}
        totalOverdue={totalOverdue}
      />
      
      {/* Maintenance Stats */}
      <MaintenanceStats 
        totalScheduled={totalScheduled}
        totalOverdue={totalOverdue}
        upcomingCount={upcomingCount}
        completedCount={completedCount}
      />
      
      {/* Alerts for overdue maintenance */}
      <MaintenanceAlerts overdueEquipment={overdueEquipment} />
      
      {/* Main content tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Maintenance</TabsTrigger>
          <TabsTrigger value="scheduler">Maintenance Scheduler</TabsTrigger>
          <TabsTrigger value="history">Maintenance History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <UpcomingMaintenanceTable 
            upcomingMaintenance={upcomingMaintenance}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </TabsContent>
        
        <TabsContent value="scheduler" className="space-y-4">
          <MaintenanceScheduler equipmentList={equipment} />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <MaintenanceHistoryTable 
            maintenanceHistory={sortedMaintenanceHistory}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
