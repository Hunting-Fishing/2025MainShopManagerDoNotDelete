import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from 'lucide-react';

export default function SepticOrders() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Service Orders</h1>
      <Card><CardContent className="p-6"><p className="text-muted-foreground">Service orders will display here from live data.</p></CardContent></Card>
    </div>
  );
}
