import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export function SchedulingSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Scheduling Settings</CardTitle>
          </div>
          <CardDescription>
            Configure time-off types, approval workflows, and scheduling rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Settings configuration will be available here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
