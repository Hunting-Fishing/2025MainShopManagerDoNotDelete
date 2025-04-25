
import React from 'react';
import { useNotifications } from '@/context/notifications';
import { toast } from '@/components/ui/use-toast';
import { Notification } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export function MaintenanceHeader() {
  const { notifications } = useNotifications();

  const handleTriggerMaintenance = () => {
    // In a real app, this would call an API to schedule maintenance
    toast({
      title: "Maintenance Scheduled",
      description: "System maintenance has been scheduled",
    });
    
    // Add maintenance notification
    const notification: Notification = {
      id: `maintenance-${Date.now()}`,
      title: "System Maintenance",
      message: "Scheduled maintenance will occur tonight at 2 AM",
      read: false,
      timestamp: new Date().toISOString(),
      type: "info",
      source: "system",
      category: "system" // This property is now allowed in our notification type
    };
    
    console.log("Added maintenance notification:", notification);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">System Maintenance</h1>
      <Button onClick={handleTriggerMaintenance} className="flex gap-2">
        <Bell className="h-4 w-4" />
        Schedule Maintenance
      </Button>
    </div>
  );
}
