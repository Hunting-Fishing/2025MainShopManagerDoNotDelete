
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Calendar, Tag, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DateRange } from "react-day-picker";
import { RemindersList } from "@/components/reminders/list/RemindersList";
import { AddReminderForm } from "@/components/reminders/AddReminderForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReminderCategoriesList } from "@/components/reminders/categories/ReminderCategoriesList";
import { ReminderTagsManager } from "@/components/reminders/tags/ReminderTagsManager";
import { ReminderTemplatesList } from "@/components/reminders/templates/ReminderTemplatesList";

export default function ServiceReminders() {
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("reminders");
  
  const handleReminderCreated = () => {
    setReminderDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Reminders</h1>
          <p className="text-muted-foreground">
            Track and manage upcoming service reminders for customers.
          </p>
        </div>
        <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
              <Plus className="h-4 w-4" />
              Add Reminder
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg">All Reminders</CardTitle>
                <div className="flex flex-row gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date Range
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <RemindersList 
                statusFilter={statusFilter} 
                dateRange={dateRange}
                priorityFilter={priorityFilter}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <ReminderTemplatesList />
        </TabsContent>
        
        <TabsContent value="categories">
          <ReminderCategoriesList />
        </TabsContent>
        
        <TabsContent value="tags">
          <ReminderTagsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
