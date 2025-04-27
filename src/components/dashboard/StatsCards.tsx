
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/types/dashboard";
import { UsersRound, PackageOpen, ClipboardCheckIcon, Clock, Star, BarChart3 } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
          <ClipboardCheckIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : stats.activeWorkOrders}</div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "" : `${stats.workOrderChange} from last month`}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <UsersRound className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : stats.teamMembers}</div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "" : `${stats.teamChange} change`}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
          <PackageOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : stats.inventoryItems}</div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "" : `${stats.inventoryChange} from last month`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : stats.avgCompletionTime}</div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "" : `${stats.completionTimeChange} from previous period`}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "—" : stats.customerSatisfaction ? `${stats.customerSatisfaction}/5` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on customer feedback
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scheduling Efficiency</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "—" : stats.schedulingEfficiency || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            Resource utilization rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
