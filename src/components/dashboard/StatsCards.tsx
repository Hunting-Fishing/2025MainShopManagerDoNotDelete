
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wrench, Package, Clock, Star, TrendingUp, TrendingDown } from "lucide-react";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white shadow-sm border-slate-200/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-20" />
              </CardTitle>
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-16" />
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

  const getChangeIcon = (change: string) => {
    if (change.includes('+')) return <TrendingUp className="h-3 w-3 text-emerald-600" />;
    if (change.includes('-')) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: string) => {
    if (change.includes('+')) return 'text-emerald-600';
    if (change.includes('-')) return 'text-red-500';
    return 'text-slate-500';
  };

  const statsData = [
    {
      title: "Active Work Orders",
      value: currentStats.activeWorkOrders,
      change: currentStats.workOrderChange,
      icon: Wrench,
      color: "bg-blue-500",
      bgGradient: "from-blue-50 to-blue-100/50"
    },
    {
      title: "Team Members",
      value: currentStats.teamMembers,
      change: currentStats.teamChange,
      icon: Users,
      color: "bg-emerald-500",
      bgGradient: "from-emerald-50 to-emerald-100/50"
    },
    {
      title: "Inventory Items",
      value: currentStats.inventoryItems,
      change: currentStats.inventoryChange,
      icon: Package,
      color: "bg-orange-500",
      bgGradient: "from-orange-50 to-orange-100/50"
    },
    {
      title: "Avg Completion Time",
      value: currentStats.avgCompletionTime,
      change: currentStats.completionTimeChange,
      icon: Clock,
      color: "bg-purple-500",
      bgGradient: "from-purple-50 to-purple-100/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${stat.bgGradient}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
              <CardTitle className="text-sm font-medium text-slate-700">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <IconComponent className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className={`text-xs flex items-center gap-1 ${getChangeColor(stat.change)}`}>
                {getChangeIcon(stat.change)}
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
