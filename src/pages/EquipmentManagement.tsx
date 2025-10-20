import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { MaintenanceRequestsList } from '@/components/equipment/MaintenanceRequestsList';
import { EquipmentReportsList } from '@/components/equipment/EquipmentReportsList';
import { PMSchedulesList } from '@/components/equipment/PMSchedulesList';
import { Wrench, ClipboardList, FileText, Calendar } from 'lucide-react';

export default function EquipmentManagement() {
  const [activeTab, setActiveTab] = useState('equipment');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipment Management</h1>
          <p className="text-muted-foreground">
            Manage marine equipment, forklifts, semis, and small engines
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Maintenance Requests
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Daily/Weekly Reports
          </TabsTrigger>
          <TabsTrigger value="pm" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            PM Schedules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          <EquipmentList />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <MaintenanceRequestsList />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <EquipmentReportsList />
        </TabsContent>

        <TabsContent value="pm" className="space-y-4">
          <PMSchedulesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
