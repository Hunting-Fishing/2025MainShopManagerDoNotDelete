
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateWorkOrder() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Work Order</h1>
        <p className="text-muted-foreground">
          Create a new work order
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Work Order Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Work order creation form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
