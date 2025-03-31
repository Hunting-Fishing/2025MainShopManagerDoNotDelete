
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmailSequenceAnalytics } from "@/types/email";
import { Users, Clock, CheckCircle, BarChart2 } from "lucide-react";

interface EmailSequenceAnalyticsCardProps {
  analytics: EmailSequenceAnalytics | null;
  loading?: boolean;
}

export function EmailSequenceAnalyticsCard({ analytics, loading = false }: EmailSequenceAnalyticsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sequence Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 animate-pulse bg-gray-200 rounded-md" />
            <div className="h-20 animate-pulse bg-gray-200 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sequence Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No analytics data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const completionRate = analytics.totalEnrollments > 0 
    ? (analytics.completedEnrollments / analytics.totalEnrollments) * 100 
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sequence Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
                <p className="text-2xl font-bold">{analytics.totalEnrollments}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{analytics.completedEnrollments}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Completion Rate</span>
                <span className="font-medium">{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time to Complete</p>
                <p className="text-2xl font-bold">
                  {analytics.averageTimeToComplete 
                    ? `${Math.round(analytics.averageTimeToComplete)} hours` 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between text-sm mb-2">
            <span>Active Enrollments</span>
            <span className="font-medium">{analytics.activeEnrollments}</span>
          </div>
          <Progress 
            value={analytics.totalEnrollments > 0 
              ? (analytics.activeEnrollments / analytics.totalEnrollments) * 100 
              : 0} 
            className="h-2" 
          />
        </div>
        
        <div className="text-xs text-muted-foreground mt-4 text-right">
          Last updated: {new Date(analytics.updatedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
