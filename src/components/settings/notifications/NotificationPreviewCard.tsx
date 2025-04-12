
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, CheckCircle, AlertTriangle, Bell, User } from "lucide-react";
import { useNotifications } from "@/context/notifications";
import { cn } from "@/lib/utils";

type NotificationType = 'info' | 'success' | 'warning' | 'error';

export function NotificationPreviewCard() {
  const { triggerTestNotification } = useNotifications();
  const [notificationType, setNotificationType] = useState<NotificationType>('info');
  
  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const handleTestNotification = () => {
    triggerTestNotification();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Previews</CardTitle>
        <CardDescription>
          Preview how different notification types will appear
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={notificationType} onValueChange={(value) => setNotificationType(value as NotificationType)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 rounded-lg border p-4">
            <div className="font-medium mb-2">Preview</div>
            
            {/* Notification Center Preview */}
            <div className="mb-6 rounded-md border shadow-sm">
              <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="font-medium text-sm">Notification Center</span>
                </div>
              </div>
              <div className="p-2">
                <div 
                  className={cn(
                    "flex items-start space-x-4 rounded-md p-3 hover:bg-muted/50 border-l-2",
                    {
                      "border-blue-500": notificationType === 'info',
                      "border-green-500": notificationType === 'success',
                      "border-amber-500": notificationType === 'warning',
                      "border-red-500": notificationType === 'error',
                    }
                  )}
                >
                  {getIconForType(notificationType)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notificationType === 'info' && 'New information available'}
                      {notificationType === 'success' && 'Operation completed successfully'}
                      {notificationType === 'warning' && 'Action needed'}
                      {notificationType === 'error' && 'Error occurred'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notificationType === 'info' && 'There is new information available for your account.'}
                      {notificationType === 'success' && 'Your changes have been saved successfully.'}
                      {notificationType === 'warning' && 'Please review your account settings.'}
                      {notificationType === 'error' && 'There was an error processing your request.'}
                    </p>
                    <p className="text-xs text-muted-foreground">1 minute ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Toast Preview */}
            <div className="mb-6 rounded-md border shadow-sm">
              <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-sm">Toast Notification</span>
                </div>
              </div>
              <div className="p-2">
                <div 
                  className={cn(
                    "flex w-full items-center justify-between space-x-4 rounded-md p-3",
                    {
                      "bg-background": notificationType === 'info',
                      "bg-green-50": notificationType === 'success',
                      "bg-amber-50": notificationType === 'warning',
                      "bg-red-50": notificationType === 'error',
                    }
                  )}
                >
                  <div className="flex items-start space-x-4">
                    {getIconForType(notificationType)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notificationType === 'info' && 'New information available'}
                        {notificationType === 'success' && 'Operation completed successfully'}
                        {notificationType === 'warning' && 'Action needed'}
                        {notificationType === 'error' && 'Error occurred'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notificationType === 'info' && 'There is new information available.'}
                        {notificationType === 'success' && 'Your changes have been saved.'}
                        {notificationType === 'warning' && 'Please review your settings.'}
                        {notificationType === 'error' && 'There was an error processing your request.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button onClick={handleTestNotification} className="w-full">
              Send Test {notificationType.charAt(0).toUpperCase() + notificationType.slice(1)} Notification
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
