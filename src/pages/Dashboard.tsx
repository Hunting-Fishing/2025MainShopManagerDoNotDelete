
import { Button } from "@/components/ui/button";
import { Plus, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentWorkOrders } from "@/components/dashboard/RecentWorkOrders";
import { WorkOrdersByStatusChart } from "@/components/dashboard/WorkOrdersByStatusChart";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { TechnicianPerformanceChart } from "@/components/dashboard/TechnicianPerformanceChart";
import { ServiceTypeDistributionChart } from "@/components/dashboard/ServiceTypeDistributionChart";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your business.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <Link to="/reports">
              <BarChart className="h-4 w-4" />
              Reports
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
            <Link to="/work-orders/new">
              <Plus className="h-4 w-4" />
              New Work Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <StatsCards />

      {/* Data Visualization Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MonthlyRevenueChart />
        <WorkOrdersByStatusChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TechnicianPerformanceChart />
        <ServiceTypeDistributionChart />
      </div>

      {/* Recent Work Orders */}
      <RecentWorkOrders />
    </div>
  );
}
