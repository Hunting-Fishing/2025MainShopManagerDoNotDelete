
import React, { useEffect } from 'react';
import { useEmailSequences } from '@/hooks/email/useEmailSequences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, CheckCircle, BarChart3 } from 'lucide-react';

interface EmailSequenceAnalyticsProps {
  sequenceId: string;
}

export const EmailSequenceAnalytics: React.FC<EmailSequenceAnalyticsProps> = ({ sequenceId }) => {
  const { analytics, analyticsLoading, fetchSequenceAnalytics } = useEmailSequences();

  useEffect(() => {
    if (sequenceId) {
      fetchSequenceAnalytics(sequenceId);
    }
  }, [sequenceId, fetchSequenceAnalytics]);

  if (analyticsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="p-4">
              <div className="h-5 w-24 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-2 w-full bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available for this sequence.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticCard
          title="Total Enrollments"
          value={analytics.totalEnrollments}
          icon={<Users className="h-4 w-4 text-blue-500" />}
          color="blue"
        />
        <AnalyticCard
          title="Active Enrollments"
          value={analytics.activeEnrollments}
          icon={<BarChart3 className="h-4 w-4 text-green-500" />}
          color="green"
        />
        <AnalyticCard
          title="Completed"
          value={analytics.completedEnrollments}
          icon={<CheckCircle className="h-4 w-4 text-purple-500" />}
          color="purple"
        />
        <AnalyticCard
          title="Conversion Rate"
          value={`${(analytics.conversionRate * 100).toFixed(1)}%`}
          icon={<BarChart3 className="h-4 w-4 text-amber-500" />}
          color="amber"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Time to Complete</span>
              <span className="font-medium">
                {analytics.averageTimeToComplete ? `${(analytics.averageTimeToComplete / 24).toFixed(1)} days` : 'N/A'}
              </span>
            </div>
            <Progress value={Math.min((analytics.averageTimeToComplete / 168) * 100, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 days</span>
              <span>7 days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface AnalyticCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

const AnalyticCard: React.FC<AnalyticCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center text-sm font-medium">
          {icon}
          <span className="ml-2">{title}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};
