
import { Card } from "@/components/ui/card";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  ShieldCheckIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";

interface StatsCardsProps {
  stats: {
    revenue: number;
    activeOrders: number;
    customers: number;
    lowStockParts: number;
    activeWorkOrders: string;
    workOrderChange: string;
    teamMembers: string;
    teamChange: string;
    inventoryItems: string;
    inventoryChange: string;
    avgCompletionTime: string;
    completionTimeChange: string;
  };
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-3"></div>
              <div className="h-8 w-32 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              Active Work Orders
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-semibold tracking-tight">
                {stats.activeWorkOrders}
              </h3>
              <p className={`text-xs ${stats.workOrderChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stats.workOrderChange}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              vs. previous period
            </p>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <WrenchIcon className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              Team Members
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-semibold tracking-tight">
                {stats.teamMembers}
              </h3>
              <p className={`text-xs ${stats.teamChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stats.teamChange}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              vs. previous period
            </p>
          </div>
          <div className="bg-amber-100 p-2 rounded-full">
            <UsersIcon className="h-4 w-4 text-amber-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              Inventory Items
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-semibold tracking-tight">
                {stats.inventoryItems}
              </h3>
              <p className={`text-xs ${stats.inventoryChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stats.inventoryChange}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              vs. previous period
            </p>
          </div>
          <div className="bg-green-100 p-2 rounded-full">
            <ShieldCheckIcon className="h-4 w-4 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              Avg. Completion Time
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-semibold tracking-tight">
                {stats.avgCompletionTime}
              </h3>
              <p className={`text-xs ${stats.completionTimeChange.startsWith('-') ? 'text-green-500' : 'text-red-500'}`}>
                {stats.completionTimeChange}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              vs. previous period
            </p>
          </div>
          <div className="bg-purple-100 p-2 rounded-full">
            <ClockIcon className="h-4 w-4 text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
