import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gauge, Route, Fuel, Wrench, Settings, History, Clock } from 'lucide-react';
import { EngineHoursTab } from '@/components/daily-logs/EngineHoursTab';
import { TripLogsTab } from '@/components/daily-logs/TripLogsTab';
import { FuelEntryTab } from '@/components/daily-logs/FuelEntryTab';
import { MaintenancePerformedTab } from '@/components/daily-logs/MaintenancePerformedTab';
import { MaintenanceIntervalSetup } from '@/components/daily-logs/MaintenanceIntervalSetup';
import { PreviousMaintenanceEntry } from '@/components/daily-logs/PreviousMaintenanceEntry';
import { DailyTimesheetTab } from '@/components/daily-logs/DailyTimesheetTab';

export default function DailyLogs() {
  const [activeTab, setActiveTab] = useState('timesheet');

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daily Logs</h1>
        <p className="text-muted-foreground">
          Record engine hours, trips, fuel entries, and maintenance with smart countdown tracking
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 h-auto gap-1">
          <TabsTrigger 
            value="timesheet" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timesheet</span>
            <span className="sm:hidden">Time</span>
          </TabsTrigger>
          <TabsTrigger 
            value="engine-hours" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline">Engine Hours</span>
            <span className="sm:hidden">Hours</span>
          </TabsTrigger>
          <TabsTrigger 
            value="trip-logs"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Route className="h-4 w-4" />
            <span className="hidden sm:inline">Trip Logs</span>
            <span className="sm:hidden">Trips</span>
          </TabsTrigger>
          <TabsTrigger 
            value="fuel-entry"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Fuel className="h-4 w-4" />
            <span className="hidden sm:inline">Fuel Entry</span>
            <span className="sm:hidden">Fuel</span>
          </TabsTrigger>
          <TabsTrigger 
            value="maintenance"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Maintenance</span>
            <span className="sm:hidden">Maint.</span>
          </TabsTrigger>
          <TabsTrigger 
            value="previous"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev.</span>
          </TabsTrigger>
          <TabsTrigger 
            value="intervals"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Intervals</span>
            <span className="sm:hidden">Setup</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timesheet" className="mt-4">
          <DailyTimesheetTab />
        </TabsContent>

        <TabsContent value="engine-hours" className="mt-4">
          <EngineHoursTab />
        </TabsContent>

        <TabsContent value="trip-logs" className="mt-4">
          <TripLogsTab />
        </TabsContent>

        <TabsContent value="fuel-entry" className="mt-4">
          <FuelEntryTab />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <MaintenancePerformedTab />
        </TabsContent>

        <TabsContent value="previous" className="mt-4">
          <PreviousMaintenanceEntry />
        </TabsContent>

        <TabsContent value="intervals" className="mt-4">
          <MaintenanceIntervalSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
}
