
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Equipment() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
      </div>
      
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Equipment Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p>Equipment inventory and details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
