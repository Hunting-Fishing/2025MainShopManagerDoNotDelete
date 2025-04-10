
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { WorkOrdersByStatusChart } from "@/components/dashboard/WorkOrdersByStatusChart";
import { RecentWorkOrders } from "@/components/dashboard/RecentWorkOrders";
import { ServiceTypeDistributionChart } from "@/components/dashboard/ServiceTypeDistributionChart";
import { getDashboardStats, getRevenueData } from "@/services/dashboardService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("month");
  const [stats, setStats] = useState({
    revenue: 0,
    activeOrders: 0,
    customers: 0,
    lowStockParts: 0,
    activeWorkOrders: "0",
    workOrderChange: "+0%",
    teamMembers: "0",
    teamChange: "+0%",
    inventoryItems: "0",
    inventoryChange: "+0%",
    avgCompletionTime: "0h",
    completionTimeChange: "+0%"
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load dashboard stats
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
        
        // Load revenue data for the chart
        const revenue = await getRevenueData(timeRange);
        setRevenueData(revenue);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [timeRange]);
  
  // Handle changing the time range for charts
  const handleTimeRangeChange = (range: "day" | "week" | "month" | "year") => {
    setTimeRange(range);
  };
  
  return (
    <div className="flex flex-col gap-5 w-full">
      <DashboardHeader />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <StatsCards stats={stats} />
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <RevenueChart 
              data={revenueData}
              isLoading={isLoading}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
            <WorkOrdersByStatusChart />
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <RecentWorkOrders />
            <ServiceTypeDistributionChart />
          </div>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Detailed sales performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sales dashboard content coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operations Overview</CardTitle>
              <CardDescription>Workflow and operational metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Operations dashboard content coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
