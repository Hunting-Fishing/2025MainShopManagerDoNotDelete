import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SummaryTabContent } from '@/components/reports/tabs/SummaryTabContent';
import { FinancialsTabContent } from '@/components/reports/tabs/FinancialsTabContent';
import { PerformanceTabContent } from '@/components/reports/tabs/PerformanceTabContent';
import { InventoryTabContent } from '@/components/reports/tabs/InventoryTabContent';
import { CustomTabContent } from '@/components/reports/tabs/CustomTabContent';
import { CustomerReportTab } from '@/components/reports/CustomerReportTab';
import { CustomReportBuilder } from '@/components/reports/CustomReportBuilder';
import { useReportData } from '@/hooks/useReportData';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReportConfig } from '@/types/reports';

export default function Reports() {
  const [customReportConfig, setCustomReportConfig] = useState<ReportConfig | null>(null);
  const { reportData, loading, error } = useReportData();

  const handleGenerateReport = (config: ReportConfig) => {
    setCustomReportConfig(config);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Reports</CardTitle>
            <CardDescription>
              Unable to load report data. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive business intelligence and performance insights
        </p>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <SummaryTabContent />
          )}
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              {Array(2).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <FinancialsTabContent />
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              {Array(2).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <PerformanceTabContent />
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              {Array(2).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <InventoryTabContent />
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerReportTab />
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <CustomTabContent 
            customReportConfig={customReportConfig}
            onGenerateReport={handleGenerateReport}
            isLoading={loading}
          />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}