import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

export const UpcomingAppointments: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Vehicle Inspection</p>
              <p className="text-sm text-muted-foreground">John Smith - 2023 Honda Civic</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              2:00 PM
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Oil Change</p>
              <p className="text-sm text-muted-foreground">Sarah Johnson - 2022 Toyota Camry</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              3:30 PM
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};