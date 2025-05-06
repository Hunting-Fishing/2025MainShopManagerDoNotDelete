
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Calendar() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
      </div>
      
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p>Calendar content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
