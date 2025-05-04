
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MaintenanceSchedule } from "@/types/equipment";
import { scheduleMaintenanceWorkOrder, calculateNextMaintenanceDate } from "@/utils/maintenanceScheduler";
import { formatDate } from "@/utils/dateUtils";
import { CalendarClock, Plus, AlertTriangle, Clock, Bell, BellOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { maintenanceFrequencyMap } from "@/data/equipmentData";

interface EquipmentMaintenanceSchedulesProps {
  equipmentId: string;
  equipmentName: string;
  schedules: MaintenanceSchedule[];
  onScheduleAdded?: () => void;
}

export function EquipmentMaintenanceSchedules({ 
  equipmentId, 
  equipmentName,
  schedules,
  onScheduleAdded
}: EquipmentMaintenanceSchedulesProps) {
  const [isScheduling, setIsScheduling] = useState<Record<string, boolean>>({});

  // Function to handle scheduling maintenance
  const handleScheduleMaintenance = async (schedule: MaintenanceSchedule) => {
    // Set loading state for this specific schedule
    setIsScheduling(prev => ({ ...prev, [schedule.nextDate]: true }));

    // Get the equipment from the current page context
    const equipment = {
      id: equipmentId,
      name: equipmentName,
    } as any; // This is simplified - in a real implementation we'd need the full equipment object

    try {
      // Call the scheduler utility to create a work order
      const result = await scheduleMaintenanceWorkOrder(equipment, schedule);
      
      if (result) {
        // If the schedule is recurring, calculate the next date
        if (schedule.isRecurring) {
          const nextDate = calculateNextMaintenanceDate(schedule.nextDate, schedule.frequencyType);
          // In a real app, we would update the schedule in the database
          console.log(`Next maintenance date calculated: ${nextDate}`);
          
          toast({
            title: "Next Maintenance Scheduled",
            description: `The next maintenance will be due on ${nextDate}`,
          });
        }
      }
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
      toast({
        title: "Error",
        description: "Failed to schedule maintenance. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clear loading state
      setIsScheduling(prev => ({ ...prev, [schedule.nextDate]: false }));
    }
  };

  // No schedules state
  if (!schedules || schedules.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b">
          <div className="flex items-center">
            <CalendarClock className="h-5 w-5 mr-2 text-slate-500" />
            <CardTitle className="text-lg">Maintenance Schedules</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onScheduleAdded}>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center text-center p-6">
            <CalendarClock className="h-12 w-12 text-slate-300 mb-2" />
            <h3 className="text-lg font-medium text-slate-900">No maintenance schedules</h3>
            <p className="text-sm text-slate-500 mt-1">
              No maintenance schedules have been set up for this equipment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine if any schedule is overdue
  const today = new Date();
  const hasOverdueSchedules = schedules.some(
    schedule => new Date(schedule.nextDate) < today
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b">
        <div className="flex items-center">
          <CalendarClock className="h-5 w-5 mr-2 text-slate-500" />
          <CardTitle className="text-lg">Maintenance Schedules</CardTitle>
          {hasOverdueSchedules && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Overdue
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onScheduleAdded}>
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Next Date</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Notifications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => {
              const isOverdue = new Date(schedule.nextDate) < today;
              
              return (
                <TableRow key={`${schedule.nextDate}-${schedule.description}`}>
                  <TableCell className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                    {formatDate(schedule.nextDate)}
                    {isOverdue && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Overdue
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {maintenanceFrequencyMap[schedule.frequencyType]}
                    {schedule.isRecurring && (
                      <span className="ml-1 text-xs text-slate-500">(Recurring)</span>
                    )}
                  </TableCell>
                  <TableCell>{schedule.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-slate-400" />
                      {schedule.estimatedDuration} hours
                    </div>
                  </TableCell>
                  <TableCell>
                    {schedule.notificationsEnabled ? (
                      <span className="inline-flex items-center text-green-600">
                        <Bell className="h-3 w-3 mr-1" />
                        {schedule.reminderDays} days before
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-500">
                        <BellOff className="h-3 w-3 mr-1" />
                        Disabled
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={isOverdue ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleScheduleMaintenance(schedule)}
                      disabled={isScheduling[schedule.nextDate]}
                    >
                      {isScheduling[schedule.nextDate] ? "Scheduling..." : "Schedule Now"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
