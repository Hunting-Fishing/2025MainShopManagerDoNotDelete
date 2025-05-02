
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useShoppingAnalytics } from '@/hooks/useShoppingAnalytics';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import StatsCards from './analytics/StatsCards';
import { ProductsByCategoryChart } from './analytics/ProductsByCategoryChart';
import { SubmissionStatusChart } from './analytics/SubmissionStatusChart';
import { useToast } from '@/components/ui/use-toast';

export const ShoppingAnalyticsDashboard: React.FC = () => {
  const { analyticsData, isLoading, error, refetch } = useShoppingAnalytics();
  const { toast } = useToast();

  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['Category', 'Product Count'];
      const rows = analyticsData.productsByCategory.map(cat => [cat.name, cat.count]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'shopping_analytics.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Analytics data has been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the analytics data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Failed to load analytics data</p>
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shopping Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ProductsByCategoryChart data={analyticsData.productsByCategory} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
            <CardDescription>Product submission approval status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <SubmissionStatusChart 
                data={analyticsData.submissionStatusData} 
                totalSubmissions={analyticsData.totalSubmissions} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Products Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Products Management</CardTitle>
          <CardDescription>
            Configure which products are showcased on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            {analyticsData.featuredProducts} of {analyticsData.totalProducts} products are currently featured.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Manage Featured Products
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingAnalyticsDashboard;
