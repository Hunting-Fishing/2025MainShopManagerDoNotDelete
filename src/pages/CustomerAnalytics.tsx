
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
  const [segmentData, setSegmentData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [clvData, setClvData] = useState<{ name: string; value: number }[]>([]);

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
        
        // Prepare segment data
        const segments: Record<string, number> = {};
        customersWithSegments.forEach(customer => {
          const customerSegments = Array.isArray(customer.segments) 
            ? customer.segments 
            : typeof customer.segments === 'object' && customer.segments
              ? Object.values(customer.segments)
              : [];
              
          if (Array.isArray(customerSegments)) {
            customerSegments.forEach(segment => {
              if (typeof segment === 'string') {
                segments[segment] = (segments[segment] || 0) + 1;
              }
            });
          }
        });
        
        // Convert to chart data format
        const segColors = {
          high_value: '#10B981', // green
          medium_value: '#3B82F6', // blue
          low_value: '#6B7280', // gray
          new: '#8B5CF6', // purple
          at_risk: '#F59E0B', // amber
          loyal: '#4F46E5', // indigo
          inactive: '#EF4444', // red
        };
        
        const segmentChartData = Object.entries(segments).map(([name, value]) => ({
          name: name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          value,
          color: segColors[name as keyof typeof segColors] || '#6B7280'
        }));
        
        setSegmentData(segmentChartData);
        
        // Prepare CLV distribution data
        const clvRanges: Record<string, number> = {
          '$0-$500': 0,
          '$501-$1,000': 0,
          '$1,001-$2,000': 0,
          '$2,001-$5,000': 0,
          '$5,001+': 0
        };
        
        customersWithSegments.forEach(customer => {
          const clv = (customer as any).clv || 0;
          if (clv <= 500) clvRanges['$0-$500']++;
          else if (clv <= 1000) clvRanges['$501-$1,000']++;
          else if (clv <= 2000) clvRanges['$1,001-$2,000']++;
          else if (clv <= 5000) clvRanges['$2,001-$5,000']++;
          else clvRanges['$5,001+']++;
        });
        
        const clvChartData = Object.entries(clvRanges).map(([name, value]) => ({
          name,
          value
        }));
        
        setClvData(clvChartData);
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
  const highValueCustomers = customers.filter(c => ((c as any).clv || 0) > averageClv * 1.5).length;
  const atRiskCustomers = customers.filter(c => {
    const segments = Array.isArray(c.segments) ? c.segments : [];
    return segments.includes('at_risk');
  }).length;

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
                <CustomerSegmentChart data={segmentData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Lifetime Value Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <CustomerLifetimeValueChart data={clvData} />
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
              <CustomerSegmentChart data={segmentData} />
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
              <CustomerLifetimeValueChart data={clvData} />
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
