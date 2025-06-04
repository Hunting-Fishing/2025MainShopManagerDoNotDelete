
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users,
  BarChart3,
  Target,
  Zap,
  Star
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { getCategoryColor } from '@/utils/categoryColors';

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface QualityIssue {
  id: string;
  type: 'missing_price' | 'missing_description' | 'missing_time' | 'duplicate_name' | 'inconsistent_pricing';
  severity: 'low' | 'medium' | 'high';
  category: string;
  subcategory?: string;
  job?: string;
  description: string;
  suggestion: string;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate quality metrics
  const qualityMetrics = useMemo(() => {
    const totalJobs = categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
    );

    const jobsWithPrice = categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => 
        subSum + sub.jobs.filter(job => job.price && job.price > 0).length, 0
      ), 0
    );

    const jobsWithTime = categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => 
        subSum + sub.jobs.filter(job => job.estimatedTime && job.estimatedTime > 0).length, 0
      ), 0
    );

    const jobsWithDescription = categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => 
        subSum + sub.jobs.filter(job => job.description && job.description.length > 10).length, 0
      ), 0
    );

    const priceCompleteness = totalJobs > 0 ? (jobsWithPrice / totalJobs) * 100 : 0;
    const timeCompleteness = totalJobs > 0 ? (jobsWithTime / totalJobs) * 100 : 0;
    const descriptionCompleteness = totalJobs > 0 ? (jobsWithDescription / totalJobs) * 100 : 0;
    const overallQuality = (priceCompleteness + timeCompleteness + descriptionCompleteness) / 3;

    return [
      {
        id: 'overall',
        name: 'Overall Quality Score',
        value: overallQuality,
        target: 90,
        status: overallQuality >= 90 ? 'good' : overallQuality >= 70 ? 'warning' : 'critical',
        trend: 'stable',
        description: 'Combined score based on price, time, and description completeness'
      },
      {
        id: 'price',
        name: 'Price Completeness',
        value: priceCompleteness,
        target: 95,
        status: priceCompleteness >= 95 ? 'good' : priceCompleteness >= 80 ? 'warning' : 'critical',
        trend: 'up',
        description: 'Percentage of jobs with pricing information'
      },
      {
        id: 'time',
        name: 'Time Estimation',
        value: timeCompleteness,
        target: 85,
        status: timeCompleteness >= 85 ? 'good' : timeCompleteness >= 70 ? 'warning' : 'critical',
        trend: 'stable',
        description: 'Percentage of jobs with time estimates'
      },
      {
        id: 'description',
        name: 'Description Quality',
        value: descriptionCompleteness,
        target: 80,
        status: descriptionCompleteness >= 80 ? 'good' : descriptionCompleteness >= 60 ? 'warning' : 'critical',
        trend: 'up',
        description: 'Percentage of jobs with detailed descriptions'
      }
    ] as QualityMetric[];
  }, [categories]);

  // Identify quality issues
  const qualityIssues = useMemo(() => {
    const issues: QualityIssue[] = [];

    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          // Missing price
          if (!job.price || job.price <= 0) {
            issues.push({
              id: `${job.id}-price`,
              type: 'missing_price',
              severity: 'high',
              category: category.name,
              subcategory: subcategory.name,
              job: job.name,
              description: `Job "${job.name}" is missing pricing information`,
              suggestion: 'Add competitive pricing based on market research'
            });
          }

          // Missing description
          if (!job.description || job.description.length < 10) {
            issues.push({
              id: `${job.id}-description`,
              type: 'missing_description',
              severity: 'medium',
              category: category.name,
              subcategory: subcategory.name,
              job: job.name,
              description: `Job "${job.name}" has insufficient description`,
              suggestion: 'Add detailed description explaining what the service includes'
            });
          }

          // Missing time estimate
          if (!job.estimatedTime || job.estimatedTime <= 0) {
            issues.push({
              id: `${job.id}-time`,
              type: 'missing_time',
              severity: 'medium',
              category: category.name,
              subcategory: subcategory.name,
              job: job.name,
              description: `Job "${job.name}" is missing time estimate`,
              suggestion: 'Add realistic time estimate based on technician experience'
            });
          }
        });
      });
    });

    return issues.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [categories]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quality Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {qualityMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Target: {metric.target}%
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' : 
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quality Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Quality Issues ({qualityIssues.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {qualityIssues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Excellent Service Quality!
              </h3>
              <p className="text-green-600">
                No quality issues found. Your service catalog is well-maintained.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {qualityIssues.slice(0, 10).map((issue) => (
                <div key={issue.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(issue.category)}>
                          {issue.category}
                        </Badge>
                        {issue.subcategory && (
                          <span className="text-sm text-gray-500">
                            → {issue.subcategory}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium mb-1">{issue.description}</h4>
                      <p className="text-sm text-gray-600 mb-2">{issue.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {qualityIssues.length > 10 && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Showing 10 of {qualityIssues.length} issues
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    View All Issues
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Quality Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => {
              const totalJobs = category.subcategories.reduce((sum, sub) => sum + sub.jobs.length, 0);
              const jobsWithPrice = category.subcategories.reduce((sum, sub) => 
                sum + sub.jobs.filter(job => job.price && job.price > 0).length, 0
              );
              const completeness = totalJobs > 0 ? (jobsWithPrice / totalJobs) * 100 : 0;
              
              return (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className={getCategoryColor(category.name)}>
                      {category.name}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {totalJobs} jobs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          completeness >= 90 ? 'bg-green-500' : 
                          completeness >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {completeness.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceQualityAnalysis;
