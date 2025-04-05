
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarClock, Bell, Plus, ClipboardCheck, Filter } from "lucide-react";
import { RemindersList } from "@/components/reminders/list/RemindersList";
import { AddReminderForm } from "@/components/reminders/AddReminderForm";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ServiceReminders() {
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const handleReminderCreated = () => {
    setReminderDialogOpen(false);
    // We would refresh the reminders list here
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
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

      <div className="flex flex-wrap gap-4 items-center">
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <DateRangePicker 
          value={dateRange}
          onChange={handleDateRangeChange}
          placeholder="Filter by date"
        />
        
        <Button variant="outline" onClick={() => {
          setStatusFilter(undefined);
          setDateRange(undefined);
        }}>
          <Filter className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
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
          <RemindersList 
            statusFilter={statusFilter}
            dateRange={dateRange}
            limit={activeTab === "upcoming" ? 30 : undefined}
          />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <RemindersList 
            statusFilter="pending"
            dateRange={dateRange}
          />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <RemindersList 
            statusFilter="completed"
            dateRange={dateRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
