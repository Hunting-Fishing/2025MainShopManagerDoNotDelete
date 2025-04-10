
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/types/dashboard";
import { formatCurrency } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton"; 
import { UsersRound, FileText, Users, Package } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  const cards = [
    {
      title: "Revenue",
      value: formatCurrency(stats.revenue),
      icon: <FileText className="h-4 w-4" />,
      description: "Total revenue this month"
    },
    {
      title: "Active Work Orders",
      value: stats.activeWorkOrders,
      change: stats.workOrderChange,
      icon: <FileText className="h-4 w-4" />,
      description: "Active work orders"
    },
    {
      title: "Team Members",
      value: stats.teamMembers,
      change: stats.teamChange,
      icon: <UsersRound className="h-4 w-4" />,
      description: "Total team members"
    },
    {
      title: "Inventory Items",
      value: stats.inventoryItems,
      change: stats.inventoryChange,
      icon: <Package className="h-4 w-4" />,
      description: "Total inventory parts"
    },
    {
      title: "Customer Count",
      value: stats.customers,
      icon: <Users className="h-4 w-4" />,
      description: "Total customers"
    },
    {
      title: "Average Completion Time",
      value: stats.avgCompletionTime,
      change: stats.completionTimeChange,
      icon: <FileText className="h-4 w-4" />,
      description: "Average work order completion time"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  
                  {isLoading ? (
                    <Skeleton className="h-7 w-20 mt-1" />
                  ) : (
                    <div className="flex items-center">
                      <h3 className="text-2xl font-bold">{card.value}</h3>
                      {card.change && (
                        <span className={`text-xs ml-2 ${
                          card.change.startsWith("+") ? "text-green-500" : "text-red-500"
                        }`}>
                          {card.change}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
