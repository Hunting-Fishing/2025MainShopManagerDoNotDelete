import React, { useEffect } from 'react';
import { useSequenceAnalytics } from '@/hooks/email/sequence/useSequenceAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EmailSequenceAnalyticsProps {
  sequenceId: string;
}

export function EmailSequenceAnalytics({ sequenceId }: EmailSequenceAnalyticsProps) {
  const { analytics, loading, error, fetchAnalytics } = useSequenceAnalytics(sequenceId);

  useEffect(() => {
    if (sequenceId) {
      fetchAnalytics(sequenceId);
    }
  }, [sequenceId, fetchAnalytics]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sequence Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p>Loading analytics data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sequence Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-red-500">Error loading analytics: {error.message}</p>
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
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p>No analytics data available for this sequence.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sequence Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium">Total Enrollments</h3>
            <p className="text-2xl font-bold">{analytics.totalEnrollments || analytics.total_enrollments}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium">Active Enrollments</h3>
            <p className="text-2xl font-bold">{analytics.activeEnrollments || analytics.active_enrollments}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium">Completed</h3>
            <p className="text-2xl font-bold">{analytics.completedEnrollments || analytics.completed_enrollments}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium">Emails Sent</h3>
            <p className="text-2xl font-bold">{analytics.emailsSent || analytics.totalEmailsSent || analytics.total_emails_sent || 0}</p>
          </div>
        </div>
        
        {analytics.timeline && analytics.timeline.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.timeline}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="enrollments" name="Enrollments" stroke="#8884d8" />
                <Line type="monotone" dataKey="emailsSent" name="Emails Sent" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {(!analytics.timeline || analytics.timeline.length === 0) && (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">No timeline data available yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
