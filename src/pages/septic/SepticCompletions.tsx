import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
export default function SepticCompletions() {
  return (<div className="p-4 md:p-6 space-y-6"><h1 className="text-2xl font-bold">Completed Services</h1><Card><CardContent className="p-6"><p className="text-muted-foreground">Completed pump-outs and inspections.</p></CardContent></Card></div>);
}
