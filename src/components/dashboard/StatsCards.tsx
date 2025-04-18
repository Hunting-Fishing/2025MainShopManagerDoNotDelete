
import { DashboardStats } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 shadow-lg rounded-xl border border-gray-100">
            <Skeleton className="h-7 w-[100px] mb-4" />
            <Skeleton className="h-5 w-[60px]" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Active Work Orders"
        value={stats.activeWorkOrders}
        change={stats.workOrderChange}
        className="bg-gradient-to-br from-blue-50 to-white"
      />
      <StatsCard
        title="Team Members"
        value={stats.teamMembers}
        change={stats.teamChange}
        className="bg-gradient-to-br from-purple-50 to-white"
      />
      <StatsCard
        title="Inventory Items"
        value={stats.inventoryItems}
        change={stats.inventoryChange}
        className="bg-gradient-to-br from-green-50 to-white"
      />
      <StatsCard
        title="Avg. Completion Time"
        value={stats.avgCompletionTime}
        change={stats.completionTimeChange}
        className="bg-gradient-to-br from-amber-50 to-white"
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  className?: string;
}

function StatsCard({ title, value, change, className }: StatsCardProps) {
  const isPositive = change?.includes('+');
  
  return (
    <Card className={`p-6 shadow-lg rounded-xl border border-gray-100 transition-transform hover:scale-[1.02] ${className}`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="flex items-center justify-between mt-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        {change && (
          <span className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            {change}
          </span>
        )}
      </div>
    </Card>
  );
}
