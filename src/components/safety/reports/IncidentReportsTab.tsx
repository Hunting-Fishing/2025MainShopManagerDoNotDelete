import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props { metrics: any; loading: boolean; }

export function IncidentReportsTab({ metrics, loading }: Props) {
  if (loading) return <Card><CardContent className="py-12 text-center">Loading...</CardContent></Card>;
  return (
    <div className="space-y-4">
      <Card><CardHeader><CardTitle>Incident Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-2xl font-bold">{metrics?.totalIncidents || 0}</p><p className="text-sm text-muted-foreground">Total Incidents</p></div>
            <div><p className="text-2xl font-bold">{metrics?.trir?.toFixed(2) || 0}</p><p className="text-sm text-muted-foreground">TRIR</p></div>
            <div><p className="text-2xl font-bold">{metrics?.dart || 0}</p><p className="text-sm text-muted-foreground">DART Cases</p></div>
            <div><p className="text-2xl font-bold">{metrics?.incidentsBySeverity?.length || 0}</p><p className="text-sm text-muted-foreground">Severity Types</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
