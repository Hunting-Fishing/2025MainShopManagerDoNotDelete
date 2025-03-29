
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/utils/workOrderUtils";
import { Equipment } from "@/types/equipment";
import { scheduleMaintenanceWorkOrder } from "@/utils/maintenanceScheduler";
import { CalendarPlus, Search, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UpcomingMaintenanceTableProps {
  upcomingMaintenance: { equipment: Equipment; dueDate: string }[];
  filterStatus: "all" | "overdue" | "scheduled";
  setFilterStatus: (status: "all" | "overdue" | "scheduled") => void;
}

export function UpcomingMaintenanceTable({ 
  upcomingMaintenance,
  filterStatus,
  setFilterStatus
}: UpcomingMaintenanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScheduling, setIsScheduling] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  
  const handleScheduleMaintenance = async (equipment: Equipment, dueDate: string) => {
    const key = `${equipment.id}-${dueDate}`;
    setIsScheduling(prev => ({ ...prev, [key]: true }));
    
    try {
      // Find the matching maintenance schedule
      const schedule = equipment.maintenanceSchedules?.find(s => s.nextDate === dueDate);
      
      if (schedule) {
        await scheduleMaintenanceWorkOrder(equipment, schedule);
        toast({
          title: "Maintenance Scheduled",
          description: `Work order created for ${equipment.name} maintenance.`,
        });
      } else {
        // If no specific schedule found, create a generic one
        const genericSchedule = {
          frequencyType: equipment.maintenanceFrequency,
          nextDate: dueDate,
          description: `Regular ${equipment.maintenanceFrequency} maintenance`,
          estimatedDuration: 2,
          isRecurring: true,
          notificationsEnabled: true,
          reminderDays: 7
        };
        
        await scheduleMaintenanceWorkOrder(equipment, genericSchedule);
        toast({
          title: "Maintenance Scheduled",
          description: `Work order created for ${equipment.name} maintenance.`,
        });
      }
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
      toast({
        title: "Error",
        description: "Failed to schedule maintenance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(prev => ({ ...prev, [key]: false }));
    }
  };
  
  const handleViewEquipment = (equipmentId: string) => {
    navigate(`/equipment/${equipmentId}`);
  };
  
  // Filter maintenance based on search query and status filter
  const filteredMaintenance = upcomingMaintenance.filter(item => {
    const matchesSearch = 
      !searchQuery ||
      item.equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.equipment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.equipment.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const today = new Date();
    const dueDate = new Date(item.dueDate);
    const isOverdue = dueDate < today;
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "overdue" && isOverdue) || 
      (filterStatus === "scheduled" && !isOverdue);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-lg" id="upcoming">Upcoming Maintenance</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search equipment..."
                className="pl-8 w-[240px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredMaintenance.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No maintenance found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {filterStatus !== "all" 
                ? `No ${filterStatus} maintenance found. Try changing your filters.`
                : "No upcoming maintenance scheduled for the next 30 days."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenance.map((item) => {
                const today = new Date();
                const dueDate = new Date(item.dueDate);
                const isOverdue = dueDate < today;
                const key = `${item.equipment.id}-${item.dueDate}`;
                
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {item.equipment.name}
                    </TableCell>
                    <TableCell>{item.equipment.customer}</TableCell>
                    <TableCell>{item.equipment.category}</TableCell>
                    <TableCell className={isOverdue ? "text-red-600 font-medium" : ""}>
                      {formatDate(item.dueDate)}
                      {isOverdue && (
                        <span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Overdue
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          isOverdue 
                            ? "bg-red-50 text-red-700" 
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {isOverdue ? "Overdue" : "Scheduled"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEquipment(item.equipment.id)}
                        >
                          View
                        </Button>
                        <Button
                          variant={isOverdue ? "destructive" : "secondary"}
                          size="sm"
                          onClick={() => handleScheduleMaintenance(item.equipment, item.dueDate)}
                          disabled={isScheduling[key]}
                        >
                          <CalendarPlus className="mr-1 h-3.5 w-3.5" />
                          {isScheduling[key] ? "Scheduling..." : "Schedule"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
