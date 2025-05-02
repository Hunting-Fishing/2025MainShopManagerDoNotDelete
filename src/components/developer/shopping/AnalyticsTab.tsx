
import React, { useState } from 'react';
import { useShoppingAnalytics } from '@/hooks/useShoppingAnalytics';
import StatsCards from './analytics/StatsCards';
import { ProductsByCategoryChart } from './analytics/ProductsByCategoryChart';
import { SubmissionStatusChart } from './analytics/SubmissionStatusChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import { Button } from "@/components/ui/button";
import seedDatabase from '@/utils/seedDatabaseData';
import { toast } from "@/hooks/use-toast";

export default function AnalyticsTab() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { analyticsData, isLoading } = useShoppingAnalytics();
  const [seeding, setSeeding] = useState(false);
  
  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await seedDatabase();
      toast({
        title: "Success",
        description: "Sample data has been added to the database.",
        variant: "success",
      });
      // Reload the page to refresh data
      window.location.reload();
    } catch (error) {
      console.error("Error seeding database:", error);
      toast({
        title: "Error",
        description: "Failed to seed sample data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analyticsData.totalProducts === 0 && (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md mb-4">
          <div className="flex flex-col gap-2">
            <p className="text-yellow-800">
              No products found in the database. You can seed some sample data to get started.
            </p>
            <Button 
              onClick={handleSeedData} 
              disabled={seeding}
              variant="outline"
              className="w-fit"
            >
              {seeding ? 'Adding sample data...' : 'Add Sample Data'}
            </Button>
          </div>
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
            <ProductsByCategoryChart data={analyticsData.productsByCategory} />

            {/* Submission Status Chart */}
            <SubmissionStatusChart 
              data={analyticsData.submissionStatusData} 
              totalSubmissions={analyticsData.totalSubmissions} 
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
