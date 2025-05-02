
import React from 'react';
import { useShoppingAnalytics } from '@/hooks/useShoppingAnalytics';
import StatsCards from './analytics/StatsCards';
import { ProductsByCategoryChart } from './analytics/ProductsByCategoryChart';
import { SubmissionStatusChart } from './analytics/SubmissionStatusChart';

export default function AnalyticsTab() {
  const { analyticsData, isLoading } = useShoppingAnalytics();
  
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
      <StatsCards />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Category Chart */}
        <ProductsByCategoryChart data={analyticsData.productsByCategory} />

        {/* Submission Status Chart */}
        <SubmissionStatusChart 
          data={analyticsData.submissionStatusData} 
          totalSubmissions={analyticsData.totalSubmissions} 
        />
      </div>
    </div>
  );
}
