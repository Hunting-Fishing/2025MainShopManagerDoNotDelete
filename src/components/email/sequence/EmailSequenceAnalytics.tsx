
import React, { useEffect } from 'react';
import { useSequenceAnalytics } from '@/hooks/email/sequence/useSequenceAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock, Users, TrendingUp } from 'lucide-react';

interface EmailSequenceAnalyticsProps {
  sequenceId: string;
}

export function EmailSequenceAnalytics({ sequenceId }: EmailSequenceAnalyticsProps) {
  const { 
    analytics, 
    analyticsLoading, 
    fetchSequenceAnalytics 
  } = useSequenceAnalytics();
  
  useEffect(() => {
    if (sequenceId) {
      fetchSequenceAnalytics(sequenceId);
    }
  }, [sequenceId, fetchSequenceAnalytics]);
  
  if (analyticsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
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
            No analytics data available for this sequence yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>Start enrolling customers to generate analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format number with percentage
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Format time in hours to readable format
  const formatTime = (hours: number) => {
    if (!hours && hours !== 0) return 'N/A';
    
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    } else {
      const days = hours / 24;
      return `${days.toFixed(1)} days`;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sequence Analytics</CardTitle>
        <CardDescription>
          Performance metrics for this email sequence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="flex items-center mb-2">
              <Users className="mr-2 h-5 w-5 text-primary" />
              <h3 className="font-medium">Enrollments</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{analytics.totalEnrollments || analytics.total_enrollments || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{analytics.activeEnrollments || analytics.active_enrollments || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="flex items-center mb-2">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              <h3 className="font-medium">Conversion Rate</h3>
            </div>
            <p className="text-3xl font-bold">
              {formatPercent(analytics.conversionRate || analytics.conversion_rate || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics.completedEnrollments || analytics.completed_enrollments || 0} completed
            </p>
          </div>
          
          <div className="p-4 border rounded-md bg-gray-50">
            <div className="flex items-center mb-2">
              <CalendarClock className="mr-2 h-5 w-5 text-primary" />
              <h3 className="font-medium">Time to Complete</h3>
            </div>
            <p className="text-3xl font-bold">
              {formatTime(analytics.averageTimeToComplete || analytics.average_time_to_complete || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Average duration
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
