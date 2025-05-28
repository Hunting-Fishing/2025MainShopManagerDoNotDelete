
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wrench, Package, Clock, Star, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    activeWorkOrders: number;
    workOrderChange: string;
    teamMembers: number;
    teamChange: string;
    inventoryItems: number;
    inventoryChange: string;
    avgCompletionTime: string;
    completionTimeChange: string;
    customerSatisfaction: number;
    schedulingEfficiency: string;
  };
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const defaultStats = {
    activeWorkOrders: 0,
    workOrderChange: "No change",
    teamMembers: 0,
    teamChange: "No change",
    inventoryItems: 0,
    inventoryChange: "No change",
    avgCompletionTime: "0 hours",
    completionTimeChange: "No change",
    customerSatisfaction: 0,
    schedulingEfficiency: "0%",
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.activeWorkOrders}</div>
          <p className="text-xs text-muted-foreground">
            {currentStats.workOrderChange} from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.teamMembers}</div>
          <p className="text-xs text-muted-foreground">
            {currentStats.teamChange} from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.inventoryItems}</div>
          <p className="text-xs text-muted-foreground">
            {currentStats.inventoryChange} from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.avgCompletionTime}</div>
          <p className="text-xs text-muted-foreground">
            {currentStats.completionTimeChange} from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
