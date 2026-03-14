import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExportCompletions() {
  return <div className="p-4 md:p-6"><h1 className="text-2xl font-bold text-foreground mb-4">Completed Shipments</h1><Card><CardContent className="p-6 text-center text-muted-foreground">Completed shipments will appear here as orders are marked delivered.</CardContent></Card></div>;
}
