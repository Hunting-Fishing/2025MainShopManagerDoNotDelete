
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShoppingPortal() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shopping Portal</h1>
        <p className="text-muted-foreground">
          Browse and purchase products
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Shopping portal will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
