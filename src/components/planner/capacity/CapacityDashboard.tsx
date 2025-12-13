import { useMemo } from 'react';
import { useStaffForPlanner, useWorkOrdersForPlanner, useEquipmentForPlanner } from '@/hooks/usePlannerData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Wrench, Ship, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ResourceCapacity } from '@/types/planner';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

const WEEKLY_HOURS = 40; // Standard work week

export function CapacityDashboard() {
  const { data: staff } = useStaffForPlanner();
  const { data: workOrders } = useWorkOrdersForPlanner();
  const { data: equipment } = useEquipmentForPlanner();

  // Calculate staff capacity
  const staffCapacity = useMemo((): ResourceCapacity[] => {
    if (!staff || !workOrders) return [];

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    return staff.map((s) => {
      const assignedWOs = workOrders.filter((wo) => {
        if (wo.assigned_technician?.id !== s.id) return false;
        if (!wo.start_time) return false;
        
        const startDate = parseISO(wo.start_time);
        return isWithinInterval(startDate, { start: weekStart, end: weekEnd });
      });

      const scheduledHours = assignedWOs.reduce((acc, wo) => {
        return acc + (wo.estimated_hours || 2); // Default 2 hours if not specified
      }, 0);

      const utilizationPercent = Math.min((scheduledHours / WEEKLY_HOURS) * 100, 100);

      return {
        id: s.id,
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email || 'Unknown',
        type: 'employee',
        totalHours: WEEKLY_HOURS,
        scheduledHours,
        availableHours: Math.max(WEEKLY_HOURS - scheduledHours, 0),
        utilizationPercent,
        avatar: s.avatar_url,
        status:
          utilizationPercent >= 100
            ? 'overloaded'
            : utilizationPercent >= 80
            ? 'busy'
            : 'available',
      };
    });
  }, [staff, workOrders]);

  // Summary stats
  const stats = useMemo(() => {
    const overloaded = staffCapacity.filter((s) => s.status === 'overloaded').length;
    const busy = staffCapacity.filter((s) => s.status === 'busy').length;
    const available = staffCapacity.filter((s) => s.status === 'available').length;
    const avgUtilization =
      staffCapacity.length > 0
        ? staffCapacity.reduce((acc, s) => acc + s.utilizationPercent, 0) / staffCapacity.length
        : 0;
    const totalScheduled = staffCapacity.reduce((acc, s) => acc + s.scheduledHours, 0);
    const totalAvailable = staffCapacity.reduce((acc, s) => acc + s.availableHours, 0);

    return { overloaded, busy, available, avgUtilization, totalScheduled, totalAvailable };
  }, [staffCapacity]);

  const getUtilizationColor = (percent: number) => {
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 80) return 'bg-amber-500';
    if (percent >= 50) return 'bg-blue-500';
    return 'bg-slate-400';
  };

  const getStatusBadge = (status: ResourceCapacity['status']) => {
    switch (status) {
      case 'overloaded':
        return <Badge variant="destructive" className="text-xs">Overloaded</Badge>;
      case 'busy':
        return <Badge className="bg-amber-500 text-xs">Busy</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Available</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.avgUtilization)}%</p>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.available}</p>
                <p className="text-sm text-muted-foreground">Available Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.totalScheduled)}h</p>
                <p className="text-sm text-muted-foreground">Hours Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overloaded}</p>
                <p className="text-sm text-muted-foreground">Overloaded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Capacity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Workload (This Week)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffCapacity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No staff data available</p>
            ) : (
              staffCapacity
                .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
                .map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={resource.avatar} />
                      <AvatarFallback>{resource.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{resource.name}</span>
                        {getStatusBadge(resource.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={resource.utilizationPercent}
                          className="h-2 flex-1"
                          indicatorClassName={getUtilizationColor(resource.utilizationPercent)}
                        />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {Math.round(resource.utilizationPercent)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-sm shrink-0">
                      <div className="font-medium">{resource.scheduledHours}h</div>
                      <div className="text-muted-foreground">of {resource.totalHours}h</div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Equipment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {equipment?.slice(0, 12).map((eq) => (
              <div
                key={eq.id}
                className="p-3 rounded-lg border border-border text-center hover:bg-muted/30 transition-colors"
              >
                <Wrench className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium text-sm truncate">{eq.name}</p>
                <Badge
                  variant={eq.status === 'available' ? 'secondary' : 'outline'}
                  className="mt-1 text-xs"
                >
                  {eq.status || 'Available'}
                </Badge>
              </div>
            ))}
            {(!equipment || equipment.length === 0) && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No equipment data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
