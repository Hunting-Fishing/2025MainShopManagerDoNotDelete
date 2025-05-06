import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { ResponsiveStack } from '@/components/ui/responsive-stack';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { fetchEquipment, getMaintenanceDueEquipment, getOverdueMaintenanceEquipment } from '@/data/equipmentData';
import { Equipment } from '@/types/equipment';

export default function Maintenance() {
  const [maintenanceDueEquipment, setMaintenanceDueEquipment] = useState<Equipment[]>([]);
  const [overdueEquipment, setOverdueEquipment] = useState<Equipment[]>([]);
  const [completedMaintenance, setCompletedMaintenance] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load equipment data
  useEffect(() => {
    const loadEquipmentData = async () => {
      try {
        const equipment = await fetchEquipment();
        const maintenanceDue = await getMaintenanceDueEquipment();
        const overdue = await getOverdueMaintenanceEquipment();

        // Filter completed maintenance in the last 30 days
        const completed = equipment.filter(item => 
          item.lastMaintenanceDate && new Date(item.lastMaintenanceDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        setMaintenanceDueEquipment(maintenanceDue);
        setOverdueEquipment(overdue);
        setCompletedMaintenance(completed);
      } catch (error) {
        console.error("Error loading equipment data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEquipmentData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-500">Loading maintenance data...</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer className="space-y-6">
      <ResponsiveStack direction="horizontal" justify="between" align="center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Maintenance Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage equipment maintenance schedules
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </ResponsiveStack>

      <ResponsiveGrid
        cols={{ default: 1, md: 3 }}
        gap="md"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              <span>Upcoming</span>
            </CardTitle>
            <CardDescription>Due within 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{maintenanceDueEquipment.length}</div>
            <div className="space-y-3">
              {maintenanceDueEquipment.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.nextMaintenanceDate}</span>
                </div>
              ))}
              {maintenanceDueEquipment.length > 3 && (
                <Button variant="link" className="px-0">View all {maintenanceDueEquipment.length}</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              <span>Overdue</span>
            </CardTitle>
            <CardDescription>Past scheduled maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4 text-red-500">{overdueEquipment.length}</div>
            <div className="space-y-3">
              {overdueEquipment.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-red-500">{item.nextMaintenanceDate}</span>
                </div>
              ))}
              {overdueEquipment.length > 3 && (
                <Button variant="link" className="px-0">View all {overdueEquipment.length}</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              <span>Completed</span>
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{completedMaintenance.length}</div>
            <div className="space-y-3">
              {completedMaintenance.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.lastMaintenanceDate}</span>
                </div>
              ))}
              {completedMaintenance.length > 3 && (
                <Button variant="link" className="px-0">View all {completedMaintenance.length}</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Schedule</CardTitle>
          <CardDescription>Upcoming maintenance tasks for all equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-medium mb-1">Connect to your database</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              This feature requires connecting to your Supabase database to track and manage maintenance schedules.
            </p>
            <Button variant="outline">Set Up Database Connection</Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}
