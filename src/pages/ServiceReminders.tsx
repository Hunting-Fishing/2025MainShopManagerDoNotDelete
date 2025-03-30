
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarClock, Bell, Plus, ClipboardCheck, Filter } from "lucide-react";
import { ServiceRemindersList } from "@/components/reminders/ServiceRemindersList";
import { AddReminderForm } from "@/components/reminders/AddReminderForm";

export default function ServiceReminders() {
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const handleReminderCreated = () => {
    setReminderDialogOpen(false);
    // We would refresh the reminders list here
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Reminders</h1>
          <p className="text-muted-foreground">
            Manage service reminders and customer follow-ups
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Service Reminder</DialogTitle>
              </DialogHeader>
              <AddReminderForm onSuccess={handleReminderCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            <CalendarClock className="mr-2 h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Bell className="mr-2 h-4 w-4" />
            Pending Notifications
          </TabsTrigger>
          <TabsTrigger value="completed">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          <ServiceRemindersList />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-lg font-medium">No pending notifications</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md">
                  There are no service reminders waiting to be sent. Create a new reminder or check the upcoming tab.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completed Reminders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardCheck className="h-12 w-12 text-slate-300 mb-2" />
                <h3 className="text-lg font-medium">No completed reminders</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md">
                  There are no completed service reminders yet. Once reminders are marked as complete, they will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
