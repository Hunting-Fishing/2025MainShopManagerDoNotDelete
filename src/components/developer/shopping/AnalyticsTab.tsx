
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, TrendingUp, ShoppingBag, Star, Users } from 'lucide-react';

interface AnalyticsData {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalManufacturers: number;
  totalSubmissions: number;
  productsByCategory: { name: string; count: number }[];
  productsByManufacturer: { name: string; count: number }[];
  submissionStatusData: { name: string; value: number }[];
}

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsTab() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    featuredProducts: 0,
    totalCategories: 0,
    totalManufacturers: 0,
    totalSubmissions: 0,
    productsByCategory: [],
    productsByManufacturer: [],
    submissionStatusData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Fetch product counts
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*');
        
        if (productsError) throw productsError;
        
        // Fetch categories
        const { data: categories, error: categoriesError } = await supabase
          .from('product_categories')
          .select('id, name');
          
        if (categoriesError) throw categoriesError;
        
        // Fetch manufacturers
        const { data: manufacturers, error: manufacturersError } = await supabase
          .from('manufacturers')
          .select('id, name');
          
        if (manufacturersError) throw manufacturersError;
        
        // Fetch submissions
        const { data: submissions, error: submissionsError } = await supabase
          .from('product_submissions')
          .select('id, status');
          
        if (submissionsError) throw submissionsError;
        
        // Calculate metrics
        const totalProducts = products?.length || 0;
        const approvedProducts = products?.filter(p => p.is_approved).length || 0;
        const pendingProducts = totalProducts - approvedProducts;
        const featuredProducts = products?.filter(p => p.is_featured).length || 0;
        
        const totalCategories = categories?.length || 0;
        const totalManufacturers = manufacturers?.length || 0;
        const totalSubmissions = submissions?.length || 0;
        
        // Products by category
        const productsByCategory = categories?.map(category => {
          const count = products?.filter(p => p.category_id === category.id).length || 0;
          return { name: category.name, count };
        }).sort((a, b) => b.count - a.count).slice(0, 6) || [];
        
        // Products by manufacturer
        const productsByManufacturer = manufacturers?.map(manufacturer => {
          const count = products?.filter(p => p.manufacturer_id === manufacturer.id).length || 0;
          return { name: manufacturer.name, count };
        }).sort((a, b) => b.count - a.count).slice(0, 6) || [];
        
        // Submission status breakdown
        const pendingSubmissions = submissions?.filter(s => s.status === 'pending').length || 0;
        const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
        const rejectedSubmissions = submissions?.filter(s => s.status === 'rejected').length || 0;
        
        const submissionStatusData = [
          { name: 'Pending', value: pendingSubmissions },
          { name: 'Approved', value: approvedSubmissions },
          { name: 'Rejected', value: rejectedSubmissions }
        ];
        
        setAnalyticsData({
          totalProducts,
          approvedProducts,
          pendingProducts,
          featuredProducts,
          totalCategories,
          totalManufacturers,
          totalSubmissions,
          productsByCategory,
          productsByManufacturer,
          submissionStatusData
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="bg-blue-100 p-2 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-700" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-slate-500">Total Products</p>
              <h3 className="text-2xl font-bold">{analyticsData.totalProducts}</h3>
            </div>
            <div className="flex items-center mt-2">
              <p className="text-xs text-slate-500">
                <span className="text-green-500 font-medium">{analyticsData.approvedProducts}</span> approved, 
                <span className="text-amber-500 font-medium"> {analyticsData.pendingProducts}</span> pending
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="bg-purple-100 p-2 rounded-full">
                <Star className="h-6 w-6 text-purple-700" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-slate-500">Featured Products</p>
              <h3 className="text-2xl font-bold">{analyticsData.featuredProducts}</h3>
            </div>
            <div className="flex items-center mt-2">
              <p className="text-xs text-slate-500">
                {((analyticsData.featuredProducts / analyticsData.totalProducts) * 100).toFixed(1)}% of products
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="bg-amber-100 p-2 rounded-full">
                <TrendingUp className="h-6 w-6 text-amber-700" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-slate-500">Categories</p>
              <h3 className="text-2xl font-bold">{analyticsData.totalCategories}</h3>
            </div>
            <div className="flex items-center mt-2">
              <p className="text-xs text-slate-500">
                {analyticsData.totalManufacturers} manufacturers
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-slate-500">Submissions</p>
              <h3 className="text-2xl font-bold">{analyticsData.totalSubmissions}</h3>
            </div>
            <div className="flex items-center mt-2">
              <p className="text-xs text-slate-500">
                From user product suggestions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Category Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {analyticsData.productsByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">No category data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.productsByCategory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    tick={{ fontSize: 12 }}
                    height={70} 
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Product Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Submission Status Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
            <CardDescription>Current status of user submissions</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {analyticsData.totalSubmissions === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">No submission data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.submissionStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.submissionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
