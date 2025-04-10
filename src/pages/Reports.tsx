
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ArrowDownToLine, FileSpreadsheet, BarChart3 } from "lucide-react";
import { 
  Chart,
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { addDays, format } from "date-fns";

// Register Chart.js components
Chart.register(
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

// Define report data interface
interface ReportData {
  revenue: number[];
  dates: string[];
  customerCount: number;
  vehicleCount: number;
  invoiceCount: number;
  workOrderCount: number;
  serviceTypeData: { label: string; value: number }[];
  revenueByService: { label: string; value: number }[];
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  
  // Initialize report data
  const reportData: ReportData = {
    revenue: [3200, 4500, 3800, 5100, 4800, 5500, 6200, 5800, 6500, 7000, 7500, 8000],
    dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    customerCount: 342,
    vehicleCount: 512,
    invoiceCount: 1280,
    workOrderCount: 1568,
    serviceTypeData: [
      { label: 'Oil Change', value: 35 },
      { label: 'Brake Service', value: 25 },
      { label: 'Tire Replacement', value: 20 },
      { label: 'Engine Repair', value: 10 },
      { label: 'Other Services', value: 10 },
    ],
    revenueByService: [
      { label: 'Oil Change', value: 15200 },
      { label: 'Brake Service', value: 28500 },
      { label: 'Tire Replacement', value: 18750 },
      { label: 'Engine Repair', value: 42300 },
      { label: 'Other Services', value: 12450 },
    ],
    totalRevenue: 117200,
    averageOrderValue: 234.40,
    totalOrders: 500
  };
  
  // Chart configuration for revenue over time
  const revenueChartData = {
    labels: reportData.dates,
    datasets: [
      {
        label: 'Revenue',
        data: reportData.revenue,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.2
      }
    ]
  };
  
  // Chart configuration for service type distribution
  const serviceTypeChartData = {
    labels: reportData.serviceTypeData.map(item => item.label),
    datasets: [
      {
        data: reportData.serviceTypeData.map(item => item.value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(99, 102, 241, 0.7)'
        ]
      }
    ]
  };
  
  // Chart configuration for revenue by service
  const revenueByServiceChartData = {
    labels: reportData.revenueByService.map(item => item.label),
    datasets: [
      {
        label: 'Revenue',
        data: reportData.revenueByService.map(item => item.value),
        backgroundColor: 'rgba(59, 130, 246, 0.7)'
      }
    ]
  };
  
  const handleDateRangeChange = (range: { from: Date, to: Date }) => {
    setDateRange(range);
    // In a real app, you would fetch new data based on the date range
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and reporting dashboards
          </p>
        </div>
        
        <div className="flex space-x-2">
          <DateRangePicker 
            date={{ from: dateRange.from, to: dateRange.to }}
            onUpdate={handleDateRangeChange}
          />
          
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          
          <Button variant="outline">
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="service">Service Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${reportData.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12.5% from previous period</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${reportData.averageOrderValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+2.1% from previous period</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8.2% from previous period</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Customer Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.customerCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+5.6% from previous period</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Monthly revenue trend</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <Line 
                    data={revenueChartData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `$${value}`
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Service Type Distribution</CardTitle>
                <CardDescription>Breakdown of service types</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-[250px]">
                    <Pie 
                      data={serviceTypeChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Service Type</CardTitle>
              <CardDescription>Revenue breakdown by service category</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <Bar 
                  data={revenueByServiceChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `$${value}`
                        }
                      }
                    }
                  }} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Detailed sales performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Sales Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Detailed sales analytics coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle>Service Analytics</CardTitle>
              <CardDescription>Service efficiency and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Service Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Detailed service analytics coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
