import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function ExportSettings() { return <div className="p-4 md:p-6"><h1 className="text-2xl font-bold text-foreground mb-4">Export Settings</h1><Card><CardHeader><CardTitle>Module Configuration</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure export module settings, default ports, currencies, and trade terms.</p></CardContent></Card></div>; }
