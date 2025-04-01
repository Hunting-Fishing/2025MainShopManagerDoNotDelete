
import React from 'react';
import { ServiceRemindersList } from '@/components/reminders/ServiceRemindersList';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ResponsiveStack } from '@/components/ui/responsive-stack';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FilterX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

export default function Reminders() {
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  
  return (
    <ResponsiveContainer className="space-y-6">
      <ResponsiveStack direction="horizontal" justify="between" align="center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Reminders</h1>
          <p className="text-muted-foreground">
            Manage service reminders and maintenance schedules
          </p>
        </div>
        <ResponsiveStack direction="horizontal" spacing="sm">
          <Button variant="outline" size="sm">
            <FilterX className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
              </DialogHeader>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    This feature requires a connection to your database. Connect your Supabase account to create and manage reminders.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => setIsAddReminderOpen(false)}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
        </ResponsiveStack>
      </ResponsiveStack>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceRemindersList />
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}
