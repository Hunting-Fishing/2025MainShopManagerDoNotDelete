
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Calendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          Schedule appointments and manage your shop's calendar
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Schedule Management</CardTitle>
          <CardDescription>Calendar features will be implemented here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Calendar functionality is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
