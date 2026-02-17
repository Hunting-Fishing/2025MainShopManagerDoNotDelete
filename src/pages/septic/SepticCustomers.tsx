import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function SepticCustomers() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>
      <Card><CardContent className="p-6"><p className="text-muted-foreground">Customer management with septic system records.</p></CardContent></Card>
    </div>
  );
}
