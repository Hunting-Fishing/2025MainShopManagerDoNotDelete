
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NotificationPreferences } from "@/types/notification";

interface NotificationCategoriesCardProps {
  preferences: NotificationPreferences;
  onSubscriptionToggle: (category: string) => void;
}

export function NotificationCategoriesCard({ preferences, onSubscriptionToggle }: NotificationCategoriesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which types of notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preferences.subscriptions.map((subscription, index) => (
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
                onCheckedChange={() => onSubscriptionToggle(subscription.category)}
              />
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}
