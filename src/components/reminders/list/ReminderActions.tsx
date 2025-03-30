
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, ChevronRight } from "lucide-react";
import { ServiceReminder, ReminderStatus } from "@/types/reminder";
import { updateReminderStatus, sendReminderNotification } from "@/services/reminderService";
import { toast } from "@/hooks/use-toast";

interface ReminderActionsProps {
  reminder: ServiceReminder;
  onStatusUpdate: (reminderId: string, updatedReminder: ServiceReminder) => void;
}

export function ReminderActions({ reminder, onStatusUpdate }: ReminderActionsProps) {
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
  );
}
