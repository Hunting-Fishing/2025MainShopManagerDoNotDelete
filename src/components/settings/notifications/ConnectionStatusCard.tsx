
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Bell } from "lucide-react";

interface ConnectionStatusCardProps {
  connectionStatus: boolean;
  onTestNotification: () => void;
}

export function ConnectionStatusCard({ 
  connectionStatus, 
  onTestNotification 
}: ConnectionStatusCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Notification System Status</CardTitle>
        </div>
        {connectionStatus ? (
          <Wifi className="h-5 w-5 text-green-500" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-500" />
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">
              {connectionStatus
                ? "You are connected to the notification system"
                : "You are disconnected from the notification system"}
            </p>
            <p className={`text-sm mt-1 ${connectionStatus ? "text-green-600" : "text-red-600"}`}>
              {connectionStatus ? "Active" : "Inactive"}
            </p>
          </div>
          <Button 
            onClick={onTestNotification}
            disabled={!connectionStatus}
            size="sm"
            variant="outline"
          >
            <Bell className="mr-2 h-4 w-4" />
            Test Notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
