import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Package, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { getDashboardStats } from "@/services/dashboardService";
import { DashboardStats } from "@/types/dashboard";

// Stats card type
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
  up: boolean | null;
}

export const StatsCards = () => {
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        
        const statsData: DashboardStats = {
          activeWorkOrders: data.activeOrders.toString(),
          workOrderChange: data.activeOrdersChange || "0%",
          teamMembers: data.teamMembersCount?.toString() || "0",
          teamChange: data.teamMembersChange || "No change",
          inventoryItems: data.inventoryItemsCount?.toString() || "0",
          inventoryChange: data.inventoryItemsChange || "0%",
          avgCompletionTime: data.averageCompletionTime || "N/A",
          completionTimeChange: data.completionTimeChange || "0%"
        };
        
        setStats([
          {
            title: "Active Work Orders",
            value: statsData.activeWorkOrders,
            icon: FileText,
            change: statsData.workOrderChange,
            up: statsData.workOrderChange.includes('+'),
          },
          {
            title: "Team Members",
            value: statsData.teamMembers,
            icon: Users,
            change: statsData.teamChange,
            up: statsData.teamChange.includes('+'),
          },
          {
            title: "Inventory Items",
            value: statsData.inventoryItems,
            icon: Package,
            change: statsData.inventoryChange,
            up: statsData.inventoryChange.includes('+'),
          },
          {
            title: "Avg. Completion Time",
            value: statsData.avgCompletionTime,
            icon: Clock,
            change: statsData.completionTimeChange,
            up: false,
          },
        ]);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-stats animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-4 w-4 bg-slate-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="card-stats">
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
            <p className="text-sm text-slate-500 mt-2">Please try again later</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-stats">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {stat.up === true && <TrendingUp className="mr-1 h-3 w-3 text-green-500" />}
              {stat.up === false && <TrendingUp className="mr-1 h-3 w-3 text-red-500 rotate-180" />}
              <span className={
                stat.up === true ? "text-green-600" : 
                stat.up === false ? "text-red-600" : ""
              }>
                {stat.change}
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
