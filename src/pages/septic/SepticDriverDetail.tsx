import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
export default function SepticDriverDetail() {
  return (<div className="p-4 md:p-6 space-y-6"><h1 className="text-2xl font-bold">Driver Detail</h1><Card><CardContent className="p-6"><p className="text-muted-foreground">Driver profile and route history.</p></CardContent></Card></div>);
}
