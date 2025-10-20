import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function PMSchedulesList() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Preventive Maintenance Schedules</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">PM schedules coming soon...</p>
      </CardContent>
    </Card>
  );
}
