import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, CheckCircle2, ChevronRight, Clock, Car } from "lucide-react";
import { ServiceReminder, ReminderStatus } from "@/types/reminder";
import { getUpcomingReminders, updateReminderStatus, sendReminderNotification } from "@/services/reminderService";
import { toast } from "@/hooks/use-toast";
import { format, isAfter, parseISO } from "date-fns";

interface ServiceRemindersListProps {
  customerId?: string;
  vehicleId?: string;
  limit?: number;
}

export function ServiceRemindersList({ customerId, vehicleId, limit }: ServiceRemindersListProps) {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        setLoading(true);
        let data: ServiceReminder[];
        
        // If customerId is provided, get reminders for that customer
        if (customerId) {
          const { getCustomerReminders } = await import("@/services/reminderService");
          data = await getCustomerReminders(customerId);
        } 
        // If vehicleId is provided, get reminders for that vehicle
        else if (vehicleId) {
          const { getVehicleReminders } = await import("@/services/reminderService");
          data = await getVehicleReminders(vehicleId);
        } 
        // Otherwise, get all upcoming reminders
        else {
          data = await getUpcomingReminders(30); // Get reminders for next 30 days
        }
        
        // Apply limit if provided
        if (limit && data.length > limit) {
          data = data.slice(0, limit);
        }
        
        setReminders(data);
      } catch (error) {
        console.error("Error loading reminders:", error);
        toast({
          title: "Error",
          description: "Failed to load service reminders.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, [customerId, vehicleId, limit]);

  const handleStatusUpdate = async (reminderId: string, newStatus: ReminderStatus) => {
    try {
      const updatedReminder = await updateReminderStatus(reminderId, newStatus);
      
      setReminders(reminders.map(reminder => 
        reminder.id === reminderId ? updatedReminder : reminder
      ));
      
      toast({
        title: "Reminder Updated",
        description: `Reminder has been marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast({
        title: "Error",
        description: "Failed to update reminder status.",
        variant: "destructive",
      });
    }
  };

  const handleSendNotification = async (reminderId: string) => {
    try {
      await sendReminderNotification(reminderId);
      
      // Update the local state to show notification was sent
      setReminders(reminders.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, notificationSent: true, notificationDate: new Date().toISOString() } 
          : reminder
      ));
      
      toast({
        title: "Notification Sent",
        description: "The service reminder notification has been sent.",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send reminder notification.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: ReminderStatus, dueDate: string) => {
    const isPastDue = isAfter(new Date(), parseISO(dueDate));
    
    switch (status) {
      case "pending":
        return (
          <Badge className={isPastDue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
            {isPastDue ? "Past Due" : "Pending"}
          </Badge>
        );
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">Notification Sent</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-slate-100 text-slate-800">Cancelled</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="text-center text-slate-500">
              Loading reminders...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mb-2" />
            <h3 className="text-lg font-medium">No reminders</h3>
            <p className="text-sm text-slate-500 mt-1">
              There are no service reminders scheduled at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Service Reminders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="p-4 hover:bg-slate-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{reminder.type}</Badge>
                    {getStatusBadge(reminder.status, reminder.dueDate)}
                  </div>
                  <h4 className="font-medium">{reminder.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{reminder.description}</p>
                  <div className="flex flex-wrap gap-x-4 mt-2 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>Due: {format(parseISO(reminder.dueDate), "MMM d, yyyy")}</span>
                    </div>
                    {reminder.vehicleId && (
                      <div className="flex items-center">
                        <Car className="h-3.5 w-3.5 mr-1" />
                        <span>Vehicle ID: {reminder.vehicleId}</span>
                      </div>
                    )}
                    {reminder.notificationSent && reminder.notificationDate && (
                      <div className="flex items-center">
                        <Bell className="h-3.5 w-3.5 mr-1" />
                        <span>Notified: {format(parseISO(reminder.notificationDate), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {reminder.status === "pending" && (
                    <>
                      {!reminder.notificationSent && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSendNotification(reminder.id)}
                        >
                          <Bell className="h-4 w-4 mr-1" />
                          Notify
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStatusUpdate(reminder.id, "completed")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
