
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Package, Clock, TrendingUp } from "lucide-react";

// Stats card type
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
  up: boolean | null;
}

export const StatsCards = () => {
  // Mock data for dashboard stats
  const stats: StatCardProps[] = [
    {
      title: "Active Work Orders",
      value: "28",
      icon: FileText,
      change: "+5%",
      up: true,
    },
    {
      title: "Team Members",
      value: "14",
      icon: Users,
      change: "No change",
      up: null,
    },
    {
      title: "Inventory Items",
      value: "156",
      icon: Package,
      change: "+12%",
      up: true,
    },
    {
      title: "Avg. Completion Time",
      value: "2.4 days",
      icon: Clock,
      change: "-8%",
      up: false,
    },
  ];

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
