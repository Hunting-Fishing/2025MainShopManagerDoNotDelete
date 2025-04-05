
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, User, Car } from "lucide-react";
import { ServiceReminder } from "@/types/reminder";
import { updateReminderStatus } from "@/services/reminderService";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ReminderListItemProps {
  reminder: ServiceReminder;
  onStatusUpdate: (reminderId: string, updatedReminder: ServiceReminder) => void;
}

export function ReminderListItem({ reminder, onStatusUpdate }: ReminderListItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      const updated = await updateReminderStatus(reminder.id, "completed");
      onStatusUpdate(reminder.id, updated);
      toast({
        title: "Reminder completed",
        description: "The reminder has been marked as completed.",
      });
    } catch (error) {
      console.error("Error completing reminder:", error);
      toast({
        title: "Error",
        description: "Failed to complete the reminder.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "sent":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-50 text-green-800 border-green-200";
      case "cancelled":
        return "bg-gray-50 text-gray-800 border-gray-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case "service":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-amber-100 text-amber-800";
      case "follow_up":
        return "bg-purple-100 text-purple-800";
      case "warranty":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatReminderType = (type: string) => {
    switch (type) {
      case "service":
        return "Service";
      case "maintenance":
        return "Maintenance";
      case "follow_up":
        return "Follow Up";
      case "warranty":
        return "Warranty";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const isPastDue = new Date(reminder.dueDate) < new Date() && reminder.status !== "completed";

  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getReminderTypeColor(reminder.type)}>
              {formatReminderType(reminder.type)}
            </Badge>
            <Badge variant="outline" className={getStatusColor(reminder.status)}>
              {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
            </Badge>
            {reminder.notificationSent && (
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                Notification Sent
              </Badge>
            )}
          </div>
          
          <h3 className="font-medium">{reminder.title}</h3>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className={isPastDue ? "text-red-600 font-medium" : ""}>
                {format(new Date(reminder.dueDate), "MMM dd, yyyy")}
                {isPastDue && " (Overdue)"}
              </span>
            </div>
            {reminder.createdBy && (
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>Created by: {reminder.createdBy}</span>
              </div>
            )}
            {reminder.completedBy && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Completed by: {reminder.completedBy}</span>
              </div>
            )}
          </div>
          
          {reminder.description && (
            <p className="text-sm text-slate-600">{reminder.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 self-start md:self-center">
          {reminder.status !== "completed" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleComplete}
              disabled={isUpdating}
              className="whitespace-nowrap"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
