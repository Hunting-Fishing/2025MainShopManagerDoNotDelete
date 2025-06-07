
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
        <p className="text-muted-foreground">
          Create and manage work orders for your shop
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Work Order Management</CardTitle>
          <CardDescription>Work order features will be implemented here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Work order management functionality is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
