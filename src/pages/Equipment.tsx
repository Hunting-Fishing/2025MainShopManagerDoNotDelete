
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Equipment() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Equipment</h1>
        <p className="text-muted-foreground">
          Manage shop equipment and maintenance schedules
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Equipment Management</CardTitle>
          <CardDescription>Equipment tracking features will be implemented here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Equipment management functionality is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
