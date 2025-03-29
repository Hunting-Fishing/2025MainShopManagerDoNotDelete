import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportExportMenu } from '@/components/reports/ReportExportMenu';
import { SavedReportsDialog } from '@/components/reports/SavedReportsDialog';
import { ComparisonReportCard } from '@/components/reports/ComparisonReportCard';
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder';
import { SavedReport, ReportConfig } from '@/types/reports';
import { toast } from "@/components/ui/use-toast";

const salesData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 2000, expenses: 9800 },
  { month: 'Apr', revenue: 2780, expenses: 3908 },
  { month: 'May', revenue: 1890, expenses: 4800 },
  { month: 'Jun', revenue: 2390, expenses: 3800 },
  { month: 'Jul', revenue: 3490, expenses: 4300 },
  { month: 'Aug', revenue: 2490, expenses: 2300 },
  { month: 'Sep', revenue: 3490, expenses: 1300 },
  { month: 'Oct', revenue: 4490, expenses: 2300 },
  { month: 'Nov', revenue: 3490, expenses: 3300 },
  { month: 'Dec', revenue: 4490, expenses: 2800 },
];

const workOrderStatusData = [
  { name: 'Completed', value: 65, color: '#0ea5e9' },
  { name: 'In Progress', value: 25, color: '#f97316' },
  { name: 'Pending', value: 10, color: '#8b5cf6' },
];

const topSellingItems = [
  { id: 1, name: 'Oil Change Service', quantity: 120, revenue: 3600 },
  { id: 2, name: 'Brake Pad Replacement', quantity: 85, revenue: 8500 },
  { id: 3, name: 'Tire Rotation', quantity: 78, revenue: 1950 },
  { id: 4, name: 'Engine Tune-up', quantity: 65, revenue: 9750 },
  { id: 5, name: 'Air Filter Replacement', quantity: 62, revenue: 1240 },
];

const servicePerformance = [
  { month: 'Jan', completedOnTime: 45, delayed: 5 },
  { month: 'Feb', completedOnTime: 50, delayed: 3 },
  { month: 'Mar', completedOnTime: 60, delayed: 7 },
  { month: 'Apr', completedOnTime: 55, delayed: 4 },
  { month: 'May', completedOnTime: 65, delayed: 2 },
  { month: 'Jun', completedOnTime: 70, delayed: 5 },
];

const comparisonRevenueData = [
  { 
    name: 'Total Revenue', 
    current: 35890, 
    previous: 30450, 
    change: 18 
  },
  { 
    name: 'Service Revenue', 
    current: 28500, 
    previous: 24100, 
    change: 18 
  },
  { 
    name: 'Parts Revenue', 
    current: 7390, 
    previous: 6350, 
    change: 16 
  },
  { 
    name: 'Average Ticket', 
    current: 450, 
    previous: 410, 
    change: 10 
  }
];

const comparisonServiceData = [
  { 
    name: 'Work Orders', 
    current: 87, 
    previous: 80, 
    change: 9 
  },
  { 
    name: 'Completion Rate', 
    current: 92, 
    previous: 88, 
    change: 5 
  },
  { 
    name: 'On-Time Rate', 
    current: 85, 
    previous: 82, 
    change: 4 
  },
  { 
    name: 'Customer Satisfaction', 
    current: 4.8, 
    previous: 4.6, 
    change: 4 
  }
];

const Reports = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [activeTab, setActiveTab] = useState('summary');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showComparison, setShowComparison] = useState(false);
  const [customReportConfig, setCustomReportConfig] = useState<ReportConfig | null>(null);
  
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    console.log("Filters applied:", newFilters);
  };
  
  const handleSaveReport = (report: SavedReport) => {
    setSavedReports([...savedReports, report]);
    toast({
      title: "Report saved",
      description: `"${report.name}" has been saved successfully`
    });
  };
  
  const handleLoadReport = (reportId: string) => {
    const report = savedReports.find(r => r.id === reportId);
    if (report) {
      setTimeframe(report.type);
      setFilters(report.filters);
      toast({
        title: "Report loaded",
        description: `"${report.name}" has been loaded successfully`
      });
    }
  };
  
  const handleDeleteReport = (reportId: string) => {
    setSavedReports(savedReports.filter(r => r.id !== reportId));
    toast({
      title: "Report deleted",
      description: "The report has been deleted successfully"
    });
  };
  
  const handleGenerateCustomReport = (config: ReportConfig) => {
    setCustomReportConfig(config);
    setActiveTab('custom');
  };

  const getDateRangeText = () => {
    if (!dateRange?.from) return "";
    if (!dateRange.to) return format(dateRange.from, "PP");
    return `${format(dateRange.from, "PP")} - ${format(dateRange.to, "PP")}`;
  };

  const topSellingColumns = [
    { header: "Item Name", dataKey: "name" },
    { header: "Quantity Sold", dataKey: "quantity" },
    { header: "Revenue", dataKey: "revenue" }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              View performance metrics and analyze business trends
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SavedReportsDialog
              savedReports={savedReports}
              onSaveReport={handleSaveReport}
              onLoadReport={handleLoadReport}
              onDeleteReport={handleDeleteReport}
              currentReport={{
                title: "Performance Report",
                type: timeframe,
                filters: filters
              }}
            />
            <CustomReportBuilder 
              onGenerateReport={handleGenerateCustomReport}
            />
            <ReportExportMenu 
              data={topSellingItems} 
              title="Top Selling Items" 
              columns={topSellingColumns}
            />
          </div>
        </div>
        
        <ReportFilters 
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onFilterChange={handleFilterChange}
        />
        
        {timeframe === 'custom' && dateRange?.from && (
          <div className="text-sm text-muted-foreground">
            Showing data for: {getDateRangeText()}
          </div>
        )}
        
        {activeTab === 'summary' && (
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? "Hide Comparison" : "Show Comparison"}
            </Button>
            {showComparison && (
              <span className="ml-3 text-sm text-muted-foreground">
                Comparing current period with previous period
              </span>
            )}
          </div>
        )}
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-6"
      >
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-5 md:grid-cols-none h-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-6">
          {showComparison ? (
            <div className="grid md:grid-cols-2 gap-6">
              <ComparisonReportCard
                title="Revenue Comparison"
                description="Revenue metrics compared to previous period"
                data={comparisonRevenueData}
                currentPeriod="Current Period"
                previousPeriod="Previous Period"
              />
              
              <ComparisonReportCard
                title="Service Performance"
                description="Service metrics compared to previous period"
                data={comparisonServiceData}
                currentPeriod="Current Period"
                previousPeriod="Previous Period"
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                  <CardDescription>Monthly financial comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={salesData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
                      <Bar dataKey="expenses" fill="#f97316" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Work Order Status</CardTitle>
                  <CardDescription>Current work order distribution</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={workOrderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {workOrderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Services/Products</CardTitle>
              <CardDescription>Highest revenue generating items</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Quantity Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellingItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Annual Revenue Breakdown</CardTitle>
              <CardDescription>Revenue by month for current year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={salesData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    activeDot={{ r: 8 }} 
                    name="Revenue" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Invoices</CardTitle>
                <CardDescription>Total: $12,450</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Due within 30 days</span>
                    <span className="text-sm">$8,200</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium">30-60 days overdue</span>
                    <span className="text-sm">$3,100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium">60+ days overdue</span>
                    <span className="text-sm">$1,150</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Profit Margin</CardTitle>
                <CardDescription>Average: 32%</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { month: 'Jan', margin: 28 },
                    { month: 'Feb', margin: 30 },
                    { month: 'Mar', margin: 25 },
                    { month: 'Apr', margin: 32 },
                    { month: 'May', margin: 35 },
                    { month: 'Jun', margin: 38 },
                    { month: 'Jul', margin: 34 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 50]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Profit Margin']} />
                    <Line 
                      type="monotone" 
                      dataKey="margin" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>Work orders completed on time vs delayed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={servicePerformance}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completedOnTime" fill="#10b981" name="Completed On Time" />
                  <Bar dataKey="delayed" fill="#ef4444" name="Delayed" />
                </BarChart>
              </CardContent>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
                <CardDescription>Work orders completed by technician</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Technician</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                      <TableHead className="text-right">Avg. Completion Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">John Smith</TableCell>
                      <TableCell className="text-right">45</TableCell>
                      <TableCell className="text-right">2.3 days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Maria Garcia</TableCell>
                      <TableCell className="text-right">38</TableCell>
                      <TableCell className="text-right">2.1 days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Robert Johnson</TableCell>
                      <TableCell className="text-right">42</TableCell>
                      <TableCell className="text-right">2.5 days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Emily Chen</TableCell>
                      <TableCell className="text-right">36</TableCell>
                      <TableCell className="text-right">2.2 days</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Based on feedback ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-blue-600">4.8</div>
                  <div className="text-sm text-muted-foreground">Average Rating (out of 5)</div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">5 Stars</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">4 Stars</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">3 Stars</span>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">2 Stars</span>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">1 Star</span>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Current stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'In Stock', value: 72, color: '#10b981' },
                        { name: 'Low Stock', value: 18, color: '#f97316' },
                        { name: 'Out of Stock', value: 10, color: '#ef4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'In Stock', value: 72, color: '#10b981' },
                        { name: 'Low Stock', value: 18, color: '#f97316' },
                        { name: 'Out of Stock', value: 10, color: '#ef4444' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Inventory Turnover</CardTitle>
                <CardDescription>Rate at which inventory is sold</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { month: 'Jan', turnover: 3.2 },
                      { month: 'Feb', turnover: 3.4 },
                      { month: 'Mar', turnover: 3.8 },
                      { month: 'Apr', turnover: 3.5 },
                      { month: 'May', turnover: 3.9 },
                      { month: 'Jun', turnover: 4.2 },
                    ]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip formatter={(value) => [value, 'Turnover Rate']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="turnover" 
                      stroke="#8b5cf6" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>Items that need to be reordered soon</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Oil Filter (Type A)</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>10</TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Low Stock</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Brake Pads (Front)</TableCell>
                    <TableCell>3</TableCell>
                    <TableCell>8</TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Low Stock</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Windshield Wiper Fluid</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Low Stock</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Air Filter (Standard)</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>15</TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Out of Stock</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6">
          {customReportConfig ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{customReportConfig.title}</CardTitle>
                  <CardDescription>{customReportConfig.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-10">
                    <p className="text-lg font-medium mb-4">Custom Report Generated</p>
                    <p className="text-muted-foreground mb-6">
                      Your custom report with {customReportConfig.fields.length} selected fields has been created.
                    </p>
                    <div className="border rounded-md p-4 bg-muted/20 text-left">
                      <h3 className="font-medium mb-2">Selected Fields:</h3>
                      <ul className="list-disc pl-5">
                        {customReportConfig.fields.map((field) => (
                          <li key={field} className="mb-1">{field}</li>
                        ))}
                      </ul>
                      
                      {customReportConfig.groupBy && (
                        <div className="mt-4">
                          <h3 className="font-medium mb-2">Grouped By:</h3>
                          <p>{customReportConfig.groupBy}</p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Sorting:</h3>
                        <p>
                          {customReportConfig.sorting.field} ({customReportConfig.sorting.direction === 'asc' ? 'Ascending' : 'Descending'})
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-6">
                      In a complete implementation, this would display the actual report data according to your specifications.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 border rounded-md bg-muted/10">
              <h3 className="text-xl font-medium mb-2">No Custom Report Generated</h3>
              <p className="text-muted-foreground mb-6">Use the Custom Report builder to create your own reports.</p>
              <CustomReportBuilder onGenerateReport={handleGenerateCustomReport} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
