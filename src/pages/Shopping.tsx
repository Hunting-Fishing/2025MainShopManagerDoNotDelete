
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Shopping() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shopping</h1>
        <p className="text-muted-foreground">
          Browse and order tools and supplies
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Shop Supplies</CardTitle>
          <CardDescription>Shopping features will be implemented here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Shopping functionality is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
