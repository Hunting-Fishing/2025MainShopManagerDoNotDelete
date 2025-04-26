
import React from "react";
import { formatDate } from "@/utils/formatters";
import { WorkOrderNotification } from "@/types/notification";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: WorkOrderNotification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  // Determine status color
  const getStatusColor = () => {
    if (!notification.status) return "bg-slate-100 text-slate-800";
    
    switch (notification.status.toLowerCase()) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "in progress":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };
  
  return (
    <div className={cn(
      "border-b border-slate-100 p-4",
      !notification.read && "bg-blue-50"
    )}>
      <div className="flex items-start">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3 mt-0.5">
          <Bell className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="text-sm font-medium">{notification.title}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
              onClick={handleMarkAsRead}
            >
              {notification.read ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {formatDate(notification.timestamp)}
            </div>
            {notification.status && (
              <Badge className={getStatusColor()}>
                {notification.status}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
