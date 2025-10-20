import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function MaintenanceRequestsList() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Maintenance Requests</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Maintenance requests coming soon...</p>
      </CardContent>
    </Card>
  );
}
