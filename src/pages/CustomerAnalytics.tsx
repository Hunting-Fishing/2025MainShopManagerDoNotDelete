
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSegmentChart } from "@/components/analytics/CustomerSegmentChart";
import { CustomerLifetimeValueChart } from "@/components/analytics/CustomerLifetimeValueChart";
import { CustomerRetentionChart } from "@/components/analytics/CustomerRetentionChart";
import { supabase } from "@/integrations/supabase/client";
import { getCustomersWithSegments } from "@/utils/analytics/customerSegmentation";

export default function CustomerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [segmentData, setSegmentData] = useState([]);
  const [clvData, setClvData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Get customer data with segments
        const customersWithSegments = await getCustomersWithSegments();
        
        // Prepare segment distribution data
        const segmentCounts = {
          'high_value': 0,
          'medium_value': 0,
          'low_value': 0,
          'new': 0,
          'loyal': 0,
          'at_risk': 0,
          'inactive': 0
        };
        
        // Process customer data
        customersWithSegments.forEach(customer => {
          customer.segments.forEach(segment => {
            segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
          });
        });
        
        // Format for chart
        const segmentChartData = [
          { name: 'High Value', value: segmentCounts.high_value, color: '#059669' },
          { name: 'Medium Value', value: segmentCounts.medium_value, color: '#0284c7' },
          { name: 'Low Value', value: segmentCounts.low_value, color: '#6b7280' },
          { name: 'New', value: segmentCounts.new, color: '#8b5cf6' },
          { name: 'Loyal', value: segmentCounts.loyal, color: '#4f46e5' },
          { name: 'At Risk', value: segmentCounts.at_risk, color: '#d97706' },
          { name: 'Inactive', value: segmentCounts.inactive, color: '#dc2626' }
        ];
        setSegmentData(segmentChartData);
        
        // Prepare CLV distribution data
        const clvRanges = {
          '$0 - $100': 0,
          '$101 - $500': 0,
          '$501 - $1,000': 0,
          '$1,001 - $2,000': 0,
          '$2,001 - $5,000': 0,
          '$5,001+': 0
        };
        
        customersWithSegments.forEach(customer => {
          if (!customer.clv) return;
          
          if (customer.clv <= 100) {
            clvRanges['$0 - $100']++;
          } else if (customer.clv <= 500) {
            clvRanges['$101 - $500']++;
          } else if (customer.clv <= 1000) {
            clvRanges['$501 - $1,000']++;
          } else if (customer.clv <= 2000) {
            clvRanges['$1,001 - $2,000']++;
          } else if (customer.clv <= 5000) {
            clvRanges['$2,001 - $5,000']++;
          } else {
            clvRanges['$5,001+']++;
          }
        });
        
        // Format for chart
        const clvChartData = Object.entries(clvRanges).map(([name, value]) => ({ name, value }));
        setClvData(clvChartData);
        
        // Generate mock retention data (would be calculated from actual customer data in a real implementation)
        const mockRetentionData = [
          { month: 'Jan', rate: 94 },
          { month: 'Feb', rate: 92 },
          { month: 'Mar', rate: 93 },
          { month: 'Apr', rate: 90 },
          { month: 'May', rate: 88 },
          { month: 'Jun', rate: 91 },
          { month: 'Jul', rate: 93 },
          { month: 'Aug', rate: 94 },
          { month: 'Sep', rate: 92 },
          { month: 'Oct', rate: 91 },
          { month: 'Nov', rate: 89 },
          { month: 'Dec', rate: 90 }
        ];
        setRetentionData(mockRetentionData);
        
        // Get top customers by value
        const sortedByValue = [...customersWithSegments]
          .filter(c => c.clv !== undefined && c.clv !== null)
          .sort((a, b) => (b.clv || 0) - (a.clv || 0))
          .slice(0, 5);
        setTopCustomers(sortedByValue);
        
        // Get at-risk customers
        const atRiskCustomers = customersWithSegments
          .filter(c => c.segments.includes('at_risk'))
          .slice(0, 5);
        setAtRiskCustomers(atRiskCustomers);
        
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Analytics</h1>
        <p className="text-muted-foreground">
          Data-driven insights to understand your customer base and identify opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Customer Lifetime Value</CardTitle>
            <CardDescription>Average value across all customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">$1,250</div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-600">↑ 12%</span> from last year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Customer Retention</CardTitle>
            <CardDescription>Yearly customer retention rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">87%</div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-green-600">↑ 3%</span> from last year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Repeat Business</CardTitle>
            <CardDescription>Customers with multiple services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">63%</div>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-amber-600">↓ 2%</span> from last year
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomerSegmentChart 
          data={segmentData} 
          loading={loading}
        />
        
        <CustomerLifetimeValueChart 
          data={clvData} 
          loading={loading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CustomerRetentionChart 
          data={retentionData} 
          loading={loading}
          className="lg:col-span-2"
        />
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Valuable Customers</CardTitle>
            <CardDescription>Top customers by lifetime value</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((customer, i) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-800 h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.first_name} {customer.last_name}</p>
                        <p className="text-xs text-muted-foreground">${customer.clv?.toLocaleString()}</p>
                      </div>
                    </div>
                    <a 
                      href={`/customers/${customer.id}`} 
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Retention Opportunities</CardTitle>
          <CardDescription>Customers at risk who need attention</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium py-2 px-2">Customer</th>
                    <th className="text-left font-medium py-2 px-2">Last Service</th>
                    <th className="text-left font-medium py-2 px-2">CLV</th>
                    <th className="text-left font-medium py-2 px-2">Risk Factors</th>
                    <th className="text-left font-medium py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-2">
                        <a 
                          href={`/customers/${customer.id}`} 
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {customer.first_name} {customer.last_name}
                        </a>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2 px-2">
                        ${customer.clv?.toLocaleString() || '0'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs">
                          {customer.orderCount ? customer.orderCount < 2 ? 'Few Orders' : 'Inactivity' : 'New Customer'}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex gap-2">
                          <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Call
                          </button>
                          <button className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded">
                            Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
