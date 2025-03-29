
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface MaintenanceStatsProps {
  totalScheduled: number;
  totalOverdue: number;
  upcomingCount: number;
  completedCount: number;
}

export function MaintenanceStats({
  totalScheduled,
  totalOverdue,
  upcomingCount,
  completedCount
}: MaintenanceStatsProps) {
  const completionRate = totalScheduled > 0 
    ? Math.round(((totalScheduled - totalOverdue) / totalScheduled) * 100) 
    : 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Scheduled Maintenance</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalScheduled}</div>
          <p className="text-xs text-muted-foreground">
            Total maintenance tasks scheduled
          </p>
        </CardContent>
      </Card>
      
      <Card className={totalOverdue > 0 ? "border-red-200" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${totalOverdue > 0 ? "text-red-500" : "text-muted-foreground"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalOverdue > 0 ? "text-red-600" : ""}`}>
            {totalOverdue}
          </div>
          <p className="text-xs text-muted-foreground">
            Maintenance tasks past due date
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Upcoming (30 days)</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingCount}</div>
          <p className="text-xs text-muted-foreground">
            Maintenance scheduled in next 30 days
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {completedCount} completed in last 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
