
import { useState } from "react";
import { useReportData } from "@/hooks/useReportData";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// Import the report tabs
import { RevenueReportTab } from "@/components/reports/RevenueReportTab";
import { ServicesReportTab } from "@/components/reports/ServicesReportTab";
import { CustomerReportTab } from "@/components/reports/CustomerReportTab";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Initialize with current date range
  const { reportData, loading, error, refetch } = useReportData();

  // Handle date range changes
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setTimeRange(range);
    refetch();
  };

  // Predefined ranges
  const handlePredefinedRange = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    setTimeRange({ from, to });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed analytics and metrics for your business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePredefinedRange(7)}>
            7 days
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePredefinedRange(30)}>
            30 days
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePredefinedRange(90)}>
            90 days
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <DateRangePicker 
            from={timeRange.from}
            to={timeRange.to}
            onUpdate={handleDateRangeChange}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Card className="p-4">
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="w-full mb-6 grid grid-cols-3">
              <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
              <TabsTrigger value="services">Service Analytics</TabsTrigger>
              <TabsTrigger value="customers">Customer Insights</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue">
              <RevenueReportTab reportData={reportData} />
            </TabsContent>
            <TabsContent value="services">
              <ServicesReportTab reportData={reportData} />
            </TabsContent>
            <TabsContent value="customers">
              <CustomerReportTab reportData={reportData} />
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
