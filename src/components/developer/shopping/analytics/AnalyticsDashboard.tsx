
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsByCategoryChart } from './ProductsByCategoryChart';
import { ProductInteractionsChart, ProductInteraction } from './ProductInteractionsChart';
import { TopProductsTable, TopProductAnalytics } from './TopProductsTable';
import { useProductAnalyticsData } from '@/hooks/useProductAnalyticsData';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { 
    analyticsData, 
    topProducts, 
    mostSavedProducts, 
    isLoading, 
    error, 
    refetch 
  } = useProductAnalyticsData();

  // Transform category data to the expected format
  const transformedCategoryData = React.useMemo(() => {
    return analyticsData?.categoryData?.map(category => ({
      name: category.name,
      count: category.views
    })) || [];
  }, [analyticsData]);

  // Transform interaction data to the expected format
  const transformedInteractionData = React.useMemo(() => {
    return analyticsData?.categoryData?.map(category => ({
      name: category.name,
      views: category.views,
      clicks: category.clicks,
      saves: category.saves,
      shares: category.shares || 0
    })) || [];
  }, [analyticsData]);

  // Calculate percentages for top products
  const processTopProducts = (products: any[], total: number): TopProductAnalytics[] => {
    return products.map(product => ({
      ...product,
      percentage: total > 0 ? (product.count / total) * 100 : 0
    }));
  };

  const topViewsWithPercentage = React.useMemo(() => {
    const total = topProducts.views?.reduce((sum, product) => sum + product.count, 0) || 0;
    return processTopProducts(topProducts.views || [], total);
  }, [topProducts.views]);

  const topClicksWithPercentage = React.useMemo(() => {
    const total = topProducts.clicks?.reduce((sum, product) => sum + product.count, 0) || 0;
    return processTopProducts(topProducts.clicks || [], total);
  }, [topProducts.clicks]);

  const topSavesWithPercentage = React.useMemo(() => {
    const total = mostSavedProducts?.reduce((sum, product) => sum + product.count, 0) || 0;
    return processTopProducts(mostSavedProducts || [], total);
  }, [mostSavedProducts]);

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
        <h2 className="text-2xl font-bold">Product Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-blue-500 shadow-md bg-white rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Views</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {analyticsData?.totalViews.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-t-4 border-green-500 shadow-md bg-white rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Clicks</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {analyticsData?.totalClicks.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-t-4 border-purple-500 shadow-md bg-white rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Products Saved</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {analyticsData?.totalSaved.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-t-4 border-amber-500 shadow-md bg-white rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Conversion Rate</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {analyticsData?.conversionRate.toFixed(2)}%
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProductsByCategoryChart data={transformedCategoryData} />
            <ProductInteractionsChart data={transformedInteractionData} />
          </div>
        </TabsContent>
        
        <TabsContent value="interactions">
          <Card className="shadow-md bg-white">
            <CardHeader>
              <CardTitle>Interaction Breakdown</CardTitle>
              <CardDescription>
                Detailed view of how users are interacting with products
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[400px]">
                <ProductInteractionsChart data={transformedInteractionData} showLegend={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopProductsTable 
              title="Most Viewed Products" 
              products={topViewsWithPercentage} 
              metric="views"
            />
            <TopProductsTable 
              title="Most Clicked Products" 
              products={topClicksWithPercentage} 
              metric="clicks"
            />
          </div>
          <div className="mt-4">
            <TopProductsTable 
              title="Most Saved Products" 
              products={topSavesWithPercentage} 
              metric="saves"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
