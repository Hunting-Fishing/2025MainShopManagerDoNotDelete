import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateCustomerLifetimeValue, getAverageCustomerLifetimeValue, getCustomersWithSegments } from '@/utils/analytics/customerLifetimeValue';
import { Customer } from '@/types/customer';
import { LoaderCircle, TrendingUp, BadgeDollarSign, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerSegmentChart } from '@/components/analytics/CustomerSegmentChart';
import { CustomerLifetimeValueChart } from '@/components/analytics/CustomerLifetimeValueChart';

export default function CustomerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [averageClv, setAverageClv] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get average CLV
        const avgClv = await getAverageCustomerLifetimeValue();
        setAverageClv(avgClv);
        
        // Get customer data with segments
        const customersWithSegments = await getCustomersWithSegments();
        setCustomers(customersWithSegments);
        setTotalCustomers(customersWithSegments.length);
      } catch (error) {
        console.error("Error loading customer analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoaderCircle className="h-12 w-12 animate-spin text-slate-500" />
        <p className="mt-4 text-slate-500">Loading customer analytics data...</p>
      </div>
    );
  }

  // Calculate stats for the dashboard
  const highValueCustomers = customers.filter(c => (c.clv || 0) > averageClv * 1.5).length;
  const atRiskCustomers = customers.filter(c => c.segments?.includes('at_risk')).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Customer Analytics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-slate-500 mr-2" />
              <span className="text-2xl font-bold">{totalCustomers}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Average Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BadgeDollarSign className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">
                ${averageClv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">High Value Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold">{highValueCustomers}</span>
              <span className="text-sm text-slate-500 ml-2">
                ({Math.round((highValueCustomers / totalCustomers) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">At Risk Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold">{atRiskCustomers}</span>
              <span className="text-sm text-slate-500 ml-2">
                ({Math.round((atRiskCustomers / totalCustomers) * 100)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different analytics views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
          <TabsTrigger value="lifetime-value">Lifetime Value</TabsTrigger>
          <TabsTrigger value="retention">Retention Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Overview content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <CustomerSegmentChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Lifetime Value Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <CustomerLifetimeValueChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="segments">
          {/* Segments content */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerSegmentChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lifetime-value">
          {/* Lifetime value content */}
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Value Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerLifetimeValueChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="retention">
          {/* Retention analysis content */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Retention Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Retention analysis content */}
              <p>Retention analysis content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
