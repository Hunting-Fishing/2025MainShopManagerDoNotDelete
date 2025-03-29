
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, BellRing, Phone } from "lucide-react";
import { NotificationPreferences } from "@/types/notification";

interface NotificationChannelsCardProps {
  preferences: NotificationPreferences;
  onChannelToggle: (channel: keyof Pick<NotificationPreferences, 'email' | 'push' | 'inApp'>) => void;
}

export function NotificationChannelsCard({ preferences, onChannelToggle }: NotificationChannelsCardProps) {
  return (
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
            checked={preferences.inApp}
            onCheckedChange={() => onChannelToggle('inApp')}
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
            checked={preferences.email}
            onCheckedChange={() => onChannelToggle('email')}
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
            checked={preferences.push}
            onCheckedChange={() => onChannelToggle('push')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
