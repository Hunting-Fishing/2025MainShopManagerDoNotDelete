
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PartsTechnicianEfficiency() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Technician Parts Usage Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Technician efficiency metrics would be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
