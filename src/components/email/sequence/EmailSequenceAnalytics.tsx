
import React, { useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { EmailSequenceAnalytics as SequenceAnalyticsType } from '@/types/email';
import { useEmailSequences } from '@/hooks/email/useEmailSequences';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailSequenceAnalyticsProps {
  sequenceId: string;
}

export function EmailSequenceAnalytics({ sequenceId }: EmailSequenceAnalyticsProps) {
  const { 
    analytics, 
    analyticsLoading, 
    fetchSequenceAnalytics,
    setAnalytics 
  } = useEmailSequences();

  useEffect(() => {
    if (sequenceId) {
      fetchSequenceAnalytics(sequenceId);
    }
  }, [sequenceId, fetchSequenceAnalytics]);

  const handleRefresh = () => {
    fetchSequenceAnalytics(sequenceId);
  };

  const barColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  if (analyticsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sequence Analytics</CardTitle>
          <CardDescription>
            Loading analytics data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sequence Analytics</CardTitle>
          <CardDescription>
            No analytics data available yet
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>There's no analytics data for this sequence yet.</p>
          <p className="mt-2">Try processing the sequence or refreshing the data.</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }

  const enrollmentData = [
    {
      name: 'Active',
      value: analytics.activeEnrollments || analytics.active_enrollments || 0
    },
    {
      name: 'Completed',
      value: analytics.completedEnrollments || analytics.completed_enrollments || 0
    }
  ];

  const conversionRate = (analytics.conversionRate || analytics.conversion_rate || 0) * 100;
  const formattedAvgTime = analytics.averageTimeToComplete || analytics.average_time_to_complete || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Sequence Analytics</CardTitle>
            <CardDescription>
              Performance metrics for this email sequence
            </CardDescription>
          </div>
          <Button onClick={handleRefresh} size="sm" variant="ghost">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Total Enrollments</div>
            <div className="text-2xl font-bold mt-1">
              {analytics.totalEnrollments || analytics.total_enrollments || 0}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Conversion Rate</div>
            <div className="text-2xl font-bold mt-1">
              {conversionRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Avg. Time to Complete</div>
            <div className="text-2xl font-bold mt-1">
              {formattedAvgTime.toFixed(1)} hours
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Enrollment Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={enrollmentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {enrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
