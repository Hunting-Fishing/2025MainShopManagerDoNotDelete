
import React, { useState } from 'react';
import { ServiceRemindersList } from '@/components/reminders/ServiceRemindersList';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ResponsiveStack } from '@/components/ui/responsive-stack';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FilterX, Calendar, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddReminderForm } from "@/components/reminders/AddReminderForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";

export default function Reminders() {
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const { toast } = useToast();
  
  const handleReminderCreated = () => {
    setIsAddReminderOpen(false);
    toast({
      title: "Reminder Created",
      description: "The service reminder has been successfully created.",
    });
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setDateRange(undefined);
  };
  
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
          <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
              </DialogHeader>
              <AddReminderForm onSuccess={handleReminderCreated} />
            </DialogContent>
          </Dialog>
        </ResponsiveStack>
      </ResponsiveStack>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="all">
              <Clock className="h-4 w-4 mr-2" />
              All Reminders
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
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
            onChange={setDateRange}
            placeholder="Filter by date"
          />

          <Button variant="outline" size="icon" onClick={resetFilters} title="Reset filters">
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TabsContent value="upcoming" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceRemindersList 
              limit={activeTab === "upcoming" ? 30 : undefined} 
              statusFilter={statusFilter !== "all" ? statusFilter : undefined}
              dateRange={dateRange}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="all" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>All Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceRemindersList 
              statusFilter={statusFilter !== "all" ? statusFilter : undefined}
              dateRange={dateRange}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </ResponsiveContainer>
  );
}
