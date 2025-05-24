
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, AlertTriangleIcon } from "lucide-react";
import { fetchEquipment, getOverdueMaintenanceEquipment } from "@/services/equipmentService";
import type { EquipmentWithMaintenance } from "@/services/equipmentService";

export default function Maintenance() {
  const [equipment, setEquipment] = useState<EquipmentWithMaintenance[]>([]);
  const [overdueEquipment, setOverdueEquipment] = useState<EquipmentWithMaintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [equipmentData, overdueData] = await Promise.all([
          fetchEquipment(),
          getOverdueMaintenanceEquipment()
        ]);
        setEquipment(equipmentData);
        setOverdueEquipment(overdueData);
      } catch (error) {
        console.error("Error loading maintenance data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading maintenance data...</div>
      </div>
    );
  }

  // Calculate upcoming maintenance (next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const upcomingMaintenance = equipment.filter(item => {
    if (!item.next_maintenance_date) return false;
    const maintenanceDate = new Date(item.next_maintenance_date);
    return maintenanceDate >= today && maintenanceDate <= thirtyDaysFromNow;
  });

  // Calculate completed maintenance (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const completedMaintenance = equipment.filter(item => {
    if (!item.last_maintenance_date) return false;
    const lastMaintenanceDate = new Date(item.last_maintenance_date);
    return lastMaintenanceDate >= thirtyDaysAgo && lastMaintenanceDate <= today;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage equipment maintenance schedules
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Maintenance
            </CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueEquipment.length}</div>
            <p className="text-xs text-muted-foreground">
              Equipment requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming (30 days)
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{upcomingMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled in the next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed (30 days)
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed in the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Lists */}
      <Tabs defaultValue="overdue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Recently Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Maintenance</CardTitle>
              <CardDescription>
                Equipment that requires immediate maintenance attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueEquipment.length === 0 ? (
                <p className="text-muted-foreground">No overdue maintenance items.</p>
              ) : (
                <div className="space-y-4">
                  {overdueEquipment.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.customer}</p>
                        <p className="text-sm text-red-600">
                          Due: {item.next_maintenance_date}
                        </p>
                      </div>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Maintenance</CardTitle>
              <CardDescription>
                Equipment scheduled for maintenance in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMaintenance.length === 0 ? (
                <p className="text-muted-foreground">No upcoming maintenance scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingMaintenance.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.customer}</p>
                        <p className="text-sm text-blue-600">
                          Scheduled: {item.next_maintenance_date}
                        </p>
                      </div>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Completed</CardTitle>
              <CardDescription>
                Maintenance completed in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedMaintenance.length === 0 ? (
                <p className="text-muted-foreground">No recently completed maintenance.</p>
              ) : (
                <div className="space-y-4">
                  {completedMaintenance.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.customer}</p>
                        <p className="text-sm text-green-600">
                          Completed: {item.last_maintenance_date}
                        </p>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
