
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Building2, TrendingUp } from "lucide-react";
import { CustomerEntity } from "@/domain/customer/entities/Customer";

interface CustomerStatsCardsProps {
  customers: CustomerEntity[];
  isLoading: boolean;
}

export function CustomerStatsCards({ customers, isLoading }: CustomerStatsCardsProps) {
  const stats = React.useMemo(() => {
    if (!customers.length) {
      return {
        total: 0,
        withVehicles: 0,
        fleetCustomers: 0,
        recentlyAdded: 0
      };
    }

    const total = customers.length;
    const withVehicles = customers.filter(c => c.hasVehicles()).length;
    const fleetCustomers = customers.filter(c => c.isFleetCustomer()).length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyAdded = customers.filter(c => 
      new Date(c.created_at) >= thirtyDaysAgo
    ).length;

    return {
      total,
      withVehicles,
      fleetCustomers,
      recentlyAdded
    };
  }, [customers]);

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

  const statsData = [
    {
      title: "Total Customers",
      value: stats.total,
      icon: Users,
      color: "bg-blue-500",
      bgGradient: "from-blue-50 to-blue-100/50"
    },
    {
      title: "With Vehicles",
      value: stats.withVehicles,
      icon: Car,
      color: "bg-emerald-500",
      bgGradient: "from-emerald-50 to-emerald-100/50"
    },
    {
      title: "Fleet Customers",
      value: stats.fleetCustomers,
      icon: Building2,
      color: "bg-orange-500",
      bgGradient: "from-orange-50 to-orange-100/50"
    },
    {
      title: "Recently Added",
      value: stats.recentlyAdded,
      icon: TrendingUp,
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
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">
                Live from database
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
