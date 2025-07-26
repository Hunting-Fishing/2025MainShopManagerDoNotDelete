import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventoryAnalytics } from '@/hooks/inventory/useInventoryAnalytics';
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

interface ReportConfig {
  type: 'summary' | 'detailed' | 'analytics' | 'valuation';
  format: 'pdf' | 'csv' | 'xlsx';
  dateRange?: DateRange;
  includeCharts: boolean;
}

export function ReportGenerator() {
  const { analytics } = useInventoryAnalytics();
  const [config, setConfig] = useState<ReportConfig>({
    type: 'summary',
    format: 'pdf',
    includeCharts: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock report data
      const reportData = {
        title: `Inventory ${config.type} Report`,
        generatedAt: new Date().toISOString(),
        dateRange: config.dateRange,
        ...analytics
      };

      // Mock file creation
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${config.type}-report.${config.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypes = [
    { value: 'summary', label: 'Summary Report', icon: FileText },
    { value: 'detailed', label: 'Detailed Inventory', icon: BarChart3 },
    { value: 'analytics', label: 'Analytics Report', icon: TrendingUp },
    { value: 'valuation', label: 'Valuation Report', icon: Download }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Generate Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={config.type} onValueChange={(value: any) => setConfig(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <type.icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <Select value={config.format} onValueChange={(value: any) => setConfig(prev => ({ ...prev, format: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF Document</SelectItem>
              <SelectItem value="csv">CSV Spreadsheet</SelectItem>
              <SelectItem value="xlsx">Excel Workbook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range (Optional)</label>
          <div className="text-sm text-muted-foreground">
            Date range picker will be implemented when needed
          </div>
        </div>

        {/* Report Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Preview</label>
          <Card className="p-4 bg-muted/30">
            <div className="space-y-2 text-sm">
              <p><strong>Type:</strong> {reportTypes.find(t => t.value === config.type)?.label}</p>
              <p><strong>Format:</strong> {config.format.toUpperCase()}</p>
              <p><strong>Total Items:</strong> {analytics.totalItems}</p>
              <p><strong>Total Value:</strong> ${analytics.totalValue.toFixed(2)}</p>
              {config.dateRange && (
                <p><strong>Date Range:</strong> {config.dateRange.from?.toLocaleDateString()} - {config.dateRange.to?.toLocaleDateString()}</p>
              )}
            </div>
          </Card>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateReport} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setConfig({ type: 'summary', format: 'pdf', includeCharts: true });
              generateReport();
            }}
          >
            Quick Summary
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setConfig({ type: 'detailed', format: 'xlsx', includeCharts: false });
              generateReport();
            }}
          >
            Export to Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}