
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShoppingAnalyticsDashboard from './ShoppingAnalyticsDashboard';

const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ShoppingAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Product Performance</h3>
            <p className="text-gray-500">
              Detailed analytics for product views, clicks, and conversion rates coming soon.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="submissions">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Submission Analytics</h3>
            <p className="text-gray-500">
              Review product submission trends and user engagement metrics (coming soon).
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
