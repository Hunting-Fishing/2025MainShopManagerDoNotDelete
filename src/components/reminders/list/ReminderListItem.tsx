
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Car, CheckCircle2, ChevronRight } from "lucide-react";
import { ServiceReminder, ReminderStatus } from "@/types/reminder";
import { format, isAfter, parseISO } from "date-fns";
import { updateReminderStatus, sendReminderNotification } from "@/services/reminderService";
import { toast } from "@/hooks/use-toast";

interface ReminderListItemProps {
  reminder: ServiceReminder;
  onStatusUpdate: (reminderId: string, updatedReminder: ServiceReminder) => void;
}

export function ReminderListItem({ reminder, onStatusUpdate }: ReminderListItemProps) {
  const handleStatusUpdate = async (reminderId: string, newStatus: ReminderStatus) => {
    try {
      const updatedReminder = await updateReminderStatus(reminderId, newStatus);
      
      onStatusUpdate(reminderId, updatedReminder);
      
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
      
      // Create a shallow copy of the reminder with updated notification properties
      const updatedReminder = { 
        ...reminder, 
        notificationSent: true, 
        notificationDate: new Date().toISOString() 
      };
      
      onStatusUpdate(reminderId, updatedReminder);
      
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

  return (
    <div className="p-4 hover:bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{reminder.type}</Badge>
            <ReminderStatusBadge status={reminder.status} dueDate={reminder.dueDate} />
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
  );
}

function ReminderStatusBadge({ status, dueDate }: { status: ReminderStatus, dueDate: string }) {
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
}
