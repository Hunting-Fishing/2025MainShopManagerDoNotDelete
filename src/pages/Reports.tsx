import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportExportMenu } from '@/components/reports/ReportExportMenu';
import { SavedReportsDialog } from '@/components/reports/dialogs/SavedReportsDialog';
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder';
import { SavedReport, ReportConfig } from '@/types/reports';
import { toast } from "@/components/ui/use-toast";
import { SummaryTabContent } from '@/components/reports/tabs/SummaryTabContent';
import { FinancialsTabContent } from '@/components/reports/tabs/FinancialsTabContent';
import { PerformanceTabContent } from '@/components/reports/tabs/PerformanceTabContent';
import { InventoryTabContent } from '@/components/reports/tabs/InventoryTabContent';
import { CustomTabContent } from '@/components/reports/tabs/CustomTabContent';
import { reportData } from '@/data/reportData';

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
              data={reportData.topSellingItems} 
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
            <button 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? "Hide Comparison" : "Show Comparison"}
            </button>
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
        
        <TabsContent value="summary">
          <SummaryTabContent 
            showComparison={showComparison}
            comparisonRevenueData={reportData.comparisonRevenueData}
            comparisonServiceData={reportData.comparisonServiceData}
            salesData={reportData.salesData}
            workOrderStatusData={reportData.workOrderStatusData}
            topSellingItems={reportData.topSellingItems}
          />
        </TabsContent>
        
        <TabsContent value="financials">
          <FinancialsTabContent 
            salesData={reportData.salesData}
          />
        </TabsContent>
        
        <TabsContent value="performance">
          <PerformanceTabContent 
            servicePerformance={reportData.servicePerformance}
          />
        </TabsContent>
        
        <TabsContent value="inventory">
          <InventoryTabContent />
        </TabsContent>
        
        <TabsContent value="custom">
          <CustomTabContent 
            customReportConfig={customReportConfig}
            onGenerateReport={handleGenerateCustomReport}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
