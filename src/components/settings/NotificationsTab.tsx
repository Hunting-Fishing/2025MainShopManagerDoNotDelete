
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationsContext";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check, Mail, BellRing, Phone, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { NotificationPreferences } from "@/types/notification";

export function NotificationsTab() {
  const { preferences, updatePreferences, updateSubscription, triggerTestNotification, connectionStatus } = useNotifications();
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(preferences);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "changed">("idle");

  // Update local state when preferences change
  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  // Track changes to know when to show the save button
  useEffect(() => {
    if (JSON.stringify(localPrefs) !== JSON.stringify(preferences)) {
      setSaveStatus("changed");
    } else {
      setSaveStatus("idle");
    }
  }, [localPrefs, preferences]);

  // Handle saving preferences
  const handleSave = () => {
    updatePreferences(localPrefs);
    setSaveStatus("saved");
    
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    });
    
    // Reset status after a delay
    setTimeout(() => {
      setSaveStatus("idle");
    }, 3000);
  };

  // Handle toggling a notification channel
  const handleChannelToggle = (channel: keyof Pick<NotificationPreferences, 'email' | 'push' | 'inApp'>) => {
    setLocalPrefs(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };

  // Handle toggling a notification subscription
  const handleSubscriptionToggle = (category: string) => {
    setLocalPrefs(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(sub => 
        sub.category === category ? { ...sub, enabled: !sub.enabled } : sub
      )
    }));
  };

  // Handle sending a test notification
  const handleTestNotification = () => {
    triggerTestNotification();
    toast({
      title: "Test notification sent",
      description: "Check your notification bell to see the test notification.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
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
            <Button variant="outline" size="sm" onClick={handleTestNotification}>
              <Bell className="mr-2 h-4 w-4" />
              Send test notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BellRing className="h-5 w-5 text-slate-500" />
              <div className="space-y-0.5">
                <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications in the application
                </p>
              </div>
            </div>
            <Switch 
              id="in-app-notifications" 
              checked={localPrefs.inApp}
              onCheckedChange={() => handleChannelToggle('inApp')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-slate-500" />
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send important notifications to your email
                </p>
              </div>
            </div>
            <Switch 
              id="email-notifications" 
              checked={localPrefs.email}
              onCheckedChange={() => handleChannelToggle('email')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Phone className="h-5 w-5 text-slate-500" />
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your mobile device
                </p>
              </div>
            </div>
            <Switch 
              id="push-notifications" 
              checked={localPrefs.push}
              onCheckedChange={() => handleChannelToggle('push')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {localPrefs.subscriptions.map((subscription, index) => (
            <React.Fragment key={subscription.category}>
              {index > 0 && <Separator />}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={`notification-${subscription.category}`} className="capitalize">
                    {subscription.category === 'workOrder' ? 'Work Order' : subscription.category} Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when {subscription.category === 'workOrder' ? 'work orders' : subscription.category}
                    {' '}are updated
                  </p>
                </div>
                <Switch 
                  id={`notification-${subscription.category}`} 
                  checked={subscription.enabled}
                  onCheckedChange={() => handleSubscriptionToggle(subscription.category)}
                />
              </div>
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      {/* Save button (only shows when changes are made) */}
      {saveStatus !== "idle" && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saveStatus === "saved"}
            className="w-24"
          >
            {saveStatus === "saved" ? (
              <>
                <Check className="mr-2 h-4 w-4" /> 
                Saved
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
