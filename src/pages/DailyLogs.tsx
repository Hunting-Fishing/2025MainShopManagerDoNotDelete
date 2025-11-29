import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, Route, Fuel, Wrench } from 'lucide-react';
import { EngineHoursTab } from '@/components/daily-logs/EngineHoursTab';
import { TripLogsTab } from '@/components/daily-logs/TripLogsTab';
import { FuelEntryTab } from '@/components/daily-logs/FuelEntryTab';
import { MaintenancePerformedTab } from '@/components/daily-logs/MaintenancePerformedTab';

export default function DailyLogs() {
  const [activeTab, setActiveTab] = useState('engine-hours');

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daily Logs</h1>
        <p className="text-muted-foreground">
          Record engine hours, trip logs, fuel entries, and maintenance performed
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1">
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
        </TabsList>

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
      </Tabs>
    </div>
  );
}
