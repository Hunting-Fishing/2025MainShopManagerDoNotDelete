
import React, { useState } from 'react';
import { useShoppingAnalytics } from '@/hooks/useShoppingAnalytics';
import StatsCards from './analytics/StatsCards';
import { ProductsByCategoryChart } from './analytics/ProductsByCategoryChart';
import { SubmissionStatusChart } from './analytics/SubmissionStatusChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsDashboard from './analytics/AnalyticsDashboard';

export default function AnalyticsTab() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { analytics, loading, error } = useShoppingAnalytics();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analytics.totalProducts === 0 && (
        <div className="p-4 border border-blue-300 bg-blue-50 rounded-md mb-4">
          <p className="text-blue-800">
            No products found in the database. Please add products through the application interface.
          </p>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Product Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <StatsCards />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Products by Category Chart */}
            <ProductsByCategoryChart data={[]} />

            {/* Submission Status Chart */}
            <SubmissionStatusChart 
              data={[]} 
              totalSubmissions={0} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
