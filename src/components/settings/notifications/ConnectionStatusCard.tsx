
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface ConnectionStatusCardProps {
  connectionStatus: boolean;
  onTestNotification: () => void;
}

export function ConnectionStatusCard({ connectionStatus, onTestNotification }: ConnectionStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Connection Status</CardTitle>
          {connectionStatus ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Offline</Badge>
          )}
        </div>
        <CardDescription>
          Status of your notification service connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm">
              {connectionStatus 
                ? "You are receiving real-time notifications" 
                : "Currently offline. Notifications will be delivered when you reconnect."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onTestNotification}>
            <Bell className="mr-2 h-4 w-4" />
            Send test notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
