
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Customers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer database and relationships
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>Customer management features will be implemented here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Customer management functionality is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
