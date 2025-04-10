
import { useState } from "react";
import { useReportData } from "@/hooks/useReportData";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent } from "@/components/ui/card";
import { addDays, format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { DownloadIcon, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function Reports() {
  const [timeRange, setTimeRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Initialize with current date range
  const { reportData, isLoading, error, fetchReportData } = useReportData();

  // Handle date range changes
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setTimeRange(range);
    fetchReportData(range);
  };

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Business Report", 14, 22);
    
    // Add date range
    doc.setFontSize(12);
    doc.text(
      `Date Range: ${format(timeRange.from, "MMM d, yyyy")} - ${format(timeRange.to, "MMM d, yyyy")}`,
      14, 32
    );
    
    // Add Revenue summary
    doc.text("Revenue Summary", 14, 42);
    
    // Add a table for revenue by service
    // @ts-ignore - jspdf-autotable typing issue
    doc.autoTable({
      startY: 45,
      head: [["Service Type", "Revenue", "Orders", "Avg Value"]],
      body: reportData.revenueByService.map((item) => [
        item.name,
        `$${item.revenue.toFixed(2)}`,
        item.count,
        `$${item.averageValue.toFixed(2)}`
      ]),
    });
    
    // Save the PDF
    doc.save("business-report.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export business reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchReportData({ start: timeRange.from, end: timeRange.to })}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={generatePDF}
            disabled={isLoading || error !== ""}
          >
            <DownloadIcon className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
          <DateRangePicker 
            date={{ from: timeRange.from, to: timeRange.to }}
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

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Revenue Summary Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Revenue Summary</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4 flex items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">${reportData.totalRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 flex items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Order Value</p>
                        <p className="text-2xl font-bold">${reportData.averageOrderValue.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 flex items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{reportData.totalOrders}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Performance Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Service Performance</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left">Service Type</th>
                          <th className="px-4 py-2 text-left">Revenue</th>
                          <th className="px-4 py-2 text-left">Orders</th>
                          <th className="px-4 py-2 text-left">Avg Value</th>
                          <th className="px-4 py-2 text-left">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.revenueByService.map((service) => (
                          <tr key={service.name} className="border-b">
                            <td className="px-4 py-2 text-sm">{service.name}</td>
                            <td className="px-4 py-2 text-sm">${service.revenue.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm">{service.count}</td>
                            <td className="px-4 py-2 text-sm">${service.averageValue.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm">{service.percentage.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
