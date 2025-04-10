
import { useState } from "react";
import { useReportData } from "@/hooks/useReportData";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, format, subDays } from "date-fns";
import { RevenueReportTab } from "@/components/reports/RevenueReportTab";
import { ServicesReportTab } from "@/components/reports/ServicesReportTab";
import { CustomerReportTab } from "@/components/reports/CustomerReportTab";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, DownloadIcon, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Reports() {
  const [selectedTab, setSelectedTab] = useState("revenue");
  const [timeRange, setTimeRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const { reportData, isLoading, error, fetchReportData } = useReportData();
  
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setTimeRange(range);
    fetchReportData({
      start: range.from,
      end: range.to
    });
  };
  
  const handleRefresh = () => {
    fetchReportData({
      start: timeRange.from,
      end: timeRange.to
    });
  };
  
  const handleExport = () => {
    // Generate a CSV or PDF report
    const reportData = {
      title: "Business Report",
      dateRange: `${format(timeRange.from, "PP")} to ${format(timeRange.to, "PP")}`,
      data: reportData
    };
    
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View and analyze your business performance data
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={isLoading}
            >
              <DownloadIcon className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Export</span>
            </Button>
          </div>
          
          <DateRangePicker 
            from={timeRange.from} 
            to={timeRange.to}
            onUpdate={handleDateRangeChange}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error loading report data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="pt-6">
        <Tabs defaultValue="revenue" value={selectedTab} onValueChange={setSelectedTab}>
          <div className="px-4 md:px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex h-[60vh] w-full flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading report data...
                </p>
              </div>
            ) : (
              <>
                <TabsContent value="revenue" className="mt-0 border-0 p-0">
                  <RevenueReportTab reportData={reportData} />
                </TabsContent>
                <TabsContent value="services" className="mt-0 border-0 p-0">
                  <ServicesReportTab reportData={reportData} />
                </TabsContent>
                <TabsContent value="customers" className="mt-0 border-0 p-0">
                  <CustomerReportTab reportData={reportData} />
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
