import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { ChartContainer } from "@/components/analytics/ChartContainer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useReportData } from "@/hooks/useReportData";
import { reportData } from "@/data/reportData";
import { format, subDays, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { ChartBarIcon, ChartLineIcon, DatabaseIcon, FileTextIcon, SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";

const Analytics = () => {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState('monthly');
  const [activeView, setActiveView] = useState("financial");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date()
  });
  const [filters, setFilters] = useState<Record<string, any>>({
    showProjections: false,
    compareWithPrevious: true,
    dataGranularity: 'monthly'
  });
  
  const { 
    data: reportDataFromHook, 
    isLoading,
    refreshData
  } = useReportData({
    timeframe,
    dateRange,
    filters,
    refreshInterval: null
  });
  
  const [analyticsData, setAnalyticsData] = useState({
    salesTrends: [] as any[],
    serviceCategoryData: [] as any[],
    customerSegments: [] as any[],
    performanceMetrics: [] as any[],
    forecastData: [] as any[],
    crossSellingOpportunities: [] as any[],
    customerRetentionData: [] as any[],
  });
  
  useEffect(() => {
    const loadAnalyticsData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalyticsData({
        salesTrends: generateSalesTrends(),
        serviceCategoryData: generateServiceCategoryData(),
        customerSegments: generateCustomerSegments(),
        performanceMetrics: generatePerformanceMetrics(),
        forecastData: generateForecastData(),
        crossSellingOpportunities: generateCrossSellingOpportunities(),
        customerRetentionData: generateCustomerRetentionData(),
      });
    };
    
    loadAnalyticsData();
  }, [timeframe, dateRange, filters]);
  
  const generateSalesTrends = () => {
    return reportData.salesData.map(item => ({
      ...item,
      projectedRevenue: item.revenue * 1.15,
      marketShare: Math.random() * 25 + 5,
      growthRate: Math.random() * 20 - 5,
    }));
  };
  
  const generateServiceCategoryData = () => {
    return [
      { name: 'Maintenance', value: 35, color: '#0ea5e9' },
      { name: 'Repairs', value: 25, color: '#f97316' },
      { name: 'Diagnostics', value: 20, color: '#8b5cf6' },
      { name: 'Upgrades', value: 15, color: '#10b981' },
      { name: 'Emergency', value: 5, color: '#ef4444' },
    ];
  };
  
  const generateCustomerSegments = () => {
    return [
      { name: 'Loyal', count: 250, spending: 4500, frequency: 5.2 },
      { name: 'Regular', count: 400, spending: 2800, frequency: 3.1 },
      { name: 'Occasional', count: 650, spending: 1200, frequency: 1.5 },
      { name: 'New', count: 300, spending: 800, frequency: 1.0 },
      { name: 'At-Risk', count: 120, spending: 3200, frequency: 2.2 },
    ];
  };
  
  const generatePerformanceMetrics = () => {
    return [
      { axis: 'Revenue', value: 0.8 },
      { axis: 'Customer Satisfaction', value: 0.9 },
      { axis: 'Efficiency', value: 0.65 },
      { axis: 'Employee Engagement', value: 0.85 },
      { axis: 'Growth', value: 0.75 },
      { axis: 'Cost Management', value: 0.7 },
    ];
  };
  
  const generateForecastData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    
    return Array(12).fill(0).map((_, i) => {
      const isProjected = i > currentMonth;
      return {
        month: format(new Date(now.getFullYear(), i, 1), 'MMM'),
        actual: isProjected ? null : Math.floor(Math.random() * 15000) + 20000,
        projected: Math.floor(Math.random() * 15000) + 22000,
        isProjected,
      };
    });
  };
  
  const generateCrossSellingOpportunities = () => {
    return [
      { primary: 'Oil Change', cross: 'Filter Replacement', strength: 0.85, value: 4500 },
      { primary: 'Brake Service', cross: 'Wheel Alignment', strength: 0.72, value: 6200 },
      { primary: 'Transmission Service', cross: 'Fluid Change', strength: 0.65, value: 3800 },
      { primary: 'Battery Replacement', cross: 'Electrical System Check', strength: 0.58, value: 2500 },
      { primary: 'Tire Rotation', cross: 'Tire Sales', strength: 0.52, value: 7800 },
    ];
  };
  
  const generateCustomerRetentionData = () => {
    return [
      { month: 'Jan', rate: 0.92, newCustomers: 45, returningCustomers: 120 },
      { month: 'Feb', rate: 0.89, newCustomers: 38, returningCustomers: 115 },
      { month: 'Mar', rate: 0.93, newCustomers: 52, returningCustomers: 132 },
      { month: 'Apr', rate: 0.91, newCustomers: 41, returningCustomers: 128 },
      { month: 'May', rate: 0.94, newCustomers: 60, returningCustomers: 145 },
      { month: 'Jun', rate: 0.95, newCustomers: 55, returningCustomers: 155 },
    ];
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(0)}%`;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('analytics.title', 'Advanced Analytics')}</h1>
            <p className="text-muted-foreground">
              {t('analytics.subtitle', 'Comprehensive business intelligence and performance metrics')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={refreshData}>
              <DatabaseIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <FileTextIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {timeframe === 'custom' && (
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Select date range"
            className="w-auto"
          />
        )}
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="compareWithPrevious" 
              checked={filters.compareWithPrevious}
              onCheckedChange={(checked) => 
                handleFilterChange('compareWithPrevious', checked)
              }
            />
            <label htmlFor="compareWithPrevious" className="text-sm">
              {t('analytics.filters.comparePrevious', 'Compare with previous period')}
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showProjections" 
              checked={filters.showProjections}
              onCheckedChange={(checked) => 
                handleFilterChange('showProjections', checked)
              }
            />
            <label htmlFor="showProjections" className="text-sm">
              {t('analytics.filters.showProjections', 'Show projections')}
            </label>
          </div>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto md:inline-flex">
          <TabsTrigger value="financial">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            {t('analytics.tabs.financial', 'Financial Insights')}
          </TabsTrigger>
          <TabsTrigger value="operations">
            <ChartLineIcon className="h-4 w-4 mr-2" />
            {t('analytics.tabs.operations', 'Operations')}
          </TabsTrigger>
          <TabsTrigger value="customers">
            <SearchIcon className="h-4 w-4 mr-2" />
            {t('analytics.tabs.customers', 'Customer Analysis')}
          </TabsTrigger>
          <TabsTrigger value="forecasting">
            <FileTextIcon className="h-4 w-4 mr-2" />
            {t('analytics.tabs.forecasting', 'Forecasting')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer 
              title={t('analytics.charts.salesTrends', 'Revenue & Expense Trends')}
              description={t('analytics.descriptions.salesTrends', 'Historical performance with key metrics')}
              isLoading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={analyticsData.salesTrends}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, ""]} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    name="Expenses" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6} 
                  />
                  {filters.showProjections && (
                    <Line 
                      type="monotone" 
                      dataKey="projectedRevenue" 
                      name="Projected Revenue" 
                      stroke="#ff7300" 
                      strokeDasharray="5 5" 
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <ChartContainer 
              title={t('analytics.charts.serviceBreakdown', 'Service Category Breakdown')}
              description={t('analytics.descriptions.serviceBreakdown', 'Revenue distribution by service type')}
              isLoading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.serviceCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.serviceCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <ChartContainer 
            title={t('analytics.charts.businessKpis', 'Business Performance KPIs')}
            description={t('analytics.descriptions.businessKpis', 'Performance assessment across key dimensions')}
            isLoading={isLoading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData.performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 1]} 
                  tickFormatter={formatPercentage} 
                />
                <Radar
                  name="Current Performance"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip formatter={(value) => [formatPercentage(value as number), ""]} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer 
              title={t('analytics.charts.techPerformance', 'Technician Efficiency')}
              description={t('analytics.descriptions.techPerformance', 'Productivity and time utilization metrics')}
              isLoading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={reportData.topSellingItems.map(item => ({
                    name: item.name,
                    efficiency: Math.random() * 30 + 70,
                    targetTime: Math.random() * 20 + 40,
                    actualTime: Math.random() * 40 + 30,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="targetTime" name="Target Hours" fill="#8884d8" />
                  <Bar dataKey="actualTime" name="Actual Hours" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <ChartContainer 
              title={t('analytics.charts.inventoryPerformance', 'Inventory Performance')}
              description={t('analytics.descriptions.inventoryPerformance', 'Stock levels and turnover analysis')}
              isLoading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={reportData.inventoryData.turnoverData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="turnover" 
                    name="Inventory Turnover" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <ChartContainer 
            title={t('analytics.charts.crossSelling', 'Cross-Selling Opportunities')}
            description={t('analytics.descriptions.crossSelling', 'Service correlation and bundling insights')}
            isLoading={isLoading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis 
                  type="category" 
                  dataKey="primary" 
                  name="Primary Service" 
                  angle={-45} 
                  textAnchor="end"
                  tickMargin={10}
                />
                <YAxis 
                  type="category" 
                  dataKey="cross" 
                  name="Cross-Sell Service" 
                />
                <ZAxis 
                  type="number" 
                  dataKey="strength" 
                  range={[50, 600]} 
                  name="Correlation Strength" 
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  formatter={(value, name) => {
                    if (name === "Correlation Strength") {
                      return [`${(Number(value) * 100).toFixed(0)}%`, name];
                    }
                    return [value, name];
                  }}
                />
                <Scatter 
                  name="Cross-Selling Opportunities" 
                  data={analyticsData.crossSellingOpportunities} 
                  fill="#8884d8" 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer 
              title={t('analytics.charts.customerSegments', 'Customer Segmentation')}
              description={t('analytics.descriptions.customerSegments', 'Analysis by customer type and value')}
              isLoading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="frequency" 
                    name="Visit Frequency" 
                    unit="/yr" 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="spending" 
                    name="Avg. Spending" 
                    unit="$" 
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="count" 
                    range={[60, 400]} 
                    name="Customer Count" 
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter 
                    name="Customer Segments" 
                    data={analyticsData.customerSegments} 
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <ChartContainer 
              title={t('analytics.charts.customerRetention', 'Customer Retention')}
              description={t('analytics.descriptions.customerRetention', 'Customer loyalty and repeat business metrics')}
              isLoading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={analyticsData.customerRetentionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#82ca9d" 
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    domain={[0, 1]}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="newCustomers" 
                    name="New Customers" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="returningCustomers" 
                    name="Returning Customers" 
                    stroke="#82ca9d" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="rate" 
                    name="Retention Rate" 
                    stroke="#ff7300" 
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-slate-200 animate-pulse rounded"></div>
                  ) : (
                    "95%"
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('analytics.metrics.satisfactionRate', 'Customer Satisfaction')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-slate-200 animate-pulse rounded"></div>
                  ) : (
                    "85%"
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('analytics.metrics.returnRate', 'Customer Return Rate')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-slate-200 animate-pulse rounded"></div>
                  ) : (
                    "$420"
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('analytics.metrics.customerLtv', 'Average Customer LTV')}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            <ChartContainer 
              title={t('analytics.charts.revenueForecast', 'Revenue Forecast')}
              description={t('analytics.descriptions.revenueForecast', 'Projected revenue for upcoming periods')}
              isLoading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analyticsData.forecastData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]} />
                  <Legend />
                  <Bar dataKey="actual" name="Actual Revenue" fill="#8884d8" />
                  <Bar dataKey="projected" name="Projected Revenue" fill="#82ca9d" fillOpacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartContainer 
                title={t('analytics.charts.marketGrowth', 'Market Growth Analysis')}
                description={t('analytics.descriptions.marketGrowth', 'Market trends and growth opportunities')}
                isLoading={isLoading}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={analyticsData.salesTrends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, ""]} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="marketShare" 
                      name="Market Share %" 
                      stroke="#8884d8" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="growthRate" 
                      name="Growth Rate %" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <ChartContainer 
                title={t('analytics.charts.seasonalPatterns', 'Seasonal Business Patterns')}
                description={t('analytics.descriptions.seasonalPatterns', 'Identifying cyclical revenue patterns')}
                isLoading={isLoading}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={[...reportData.salesData, ...reportData.salesData.slice(0, 4)]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, ""]} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue Pattern" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
