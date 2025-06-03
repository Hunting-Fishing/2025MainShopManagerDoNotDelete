
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  FileText,
  Wrench
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  // Calculate quality metrics
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
  const totalJobs = categories.reduce((sum, cat) => 
    sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0);

  // Quality checks
  const categoriesWithDescription = categories.filter(cat => cat.description).length;
  const jobsWithDescription = categories.reduce((sum, cat) => 
    sum + cat.subcategories.reduce((subSum, sub) => 
      subSum + sub.jobs.filter(job => job.description).length, 0), 0);
  const jobsWithPrice = categories.reduce((sum, cat) => 
    sum + cat.subcategories.reduce((subSum, sub) => 
      subSum + sub.jobs.filter(job => job.price).length, 0), 0);
  const jobsWithTime = categories.reduce((sum, cat) => 
    sum + cat.subcategories.reduce((subSum, sub) => 
      subSum + sub.jobs.filter(job => job.estimatedTime).length, 0), 0);

  // Calculate percentages
  const descriptionCoverage = totalCategories > 0 ? (categoriesWithDescription / totalCategories) * 100 : 0;
  const jobDescriptionCoverage = totalJobs > 0 ? (jobsWithDescription / totalJobs) * 100 : 0;
  const priceCoverage = totalJobs > 0 ? (jobsWithPrice / totalJobs) * 100 : 0;
  const timeCoverage = totalJobs > 0 ? (jobsWithTime / totalJobs) * 100 : 0;

  // Overall quality score
  const overallScore = (descriptionCoverage + jobDescriptionCoverage + priceCoverage + timeCoverage) / 4;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const, color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { label: 'Good', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Improvement', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' };
  };

  const issues = [
    ...(descriptionCoverage < 80 ? [{ 
      type: 'Category Descriptions', 
      count: totalCategories - categoriesWithDescription,
      severity: 'medium' as const
    }] : []),
    ...(jobDescriptionCoverage < 80 ? [{ 
      type: 'Service Descriptions', 
      count: totalJobs - jobsWithDescription,
      severity: 'medium' as const
    }] : []),
    ...(priceCoverage < 60 ? [{ 
      type: 'Service Pricing', 
      count: totalJobs - jobsWithPrice,
      severity: 'high' as const
    }] : []),
    ...(timeCoverage < 60 ? [{ 
      type: 'Time Estimates', 
      count: totalJobs - jobsWithTime,
      severity: 'high' as const
    }] : [])
  ];

  if (totalCategories === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data to Analyze</h3>
            <p className="text-gray-600">Add some service categories to see quality analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Service Quality Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore.toFixed(0)}%
              </div>
              <Badge className={getScoreBadge(overallScore).color}>
                {getScoreBadge(overallScore).label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Overall Quality</div>
              <Progress value={overallScore} className="w-32 mt-1" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Based on completeness of descriptions, pricing, and time estimates
          </p>
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Category Descriptions</div>
                <div className="text-xl font-semibold">{descriptionCoverage.toFixed(0)}%</div>
                <div className="text-xs text-gray-500">{categoriesWithDescription}/{totalCategories}</div>
              </div>
            </div>
            <Progress value={descriptionCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Service Descriptions</div>
                <div className="text-xl font-semibold">{jobDescriptionCoverage.toFixed(0)}%</div>
                <div className="text-xs text-gray-500">{jobsWithDescription}/{totalJobs}</div>
              </div>
            </div>
            <Progress value={jobDescriptionCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Pricing Information</div>
                <div className="text-xl font-semibold">{priceCoverage.toFixed(0)}%</div>
                <div className="text-xs text-gray-500">{jobsWithPrice}/{totalJobs}</div>
              </div>
            </div>
            <Progress value={priceCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-sm text-gray-600">Time Estimates</div>
                <div className="text-xl font-semibold">{timeCoverage.toFixed(0)}%</div>
                <div className="text-xs text-gray-500">{jobsWithTime}/{totalJobs}</div>
              </div>
            </div>
            <Progress value={timeCoverage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Issues and Recommendations */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Quality Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-4 w-4 ${
                      issue.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <div>
                      <div className="font-medium">{issue.type}</div>
                      <div className="text-sm text-gray-600">
                        {issue.count} item{issue.count !== 1 ? 's' : ''} missing information
                      </div>
                    </div>
                  </div>
                  <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'}>
                    {issue.severity === 'high' ? 'High Priority' : 'Medium Priority'}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Improve your service quality by adding missing information to increase customer trust and booking rates.
              </p>
              <Button onClick={onRefresh} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Refresh Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Service Catalog Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCategories}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalSubcategories}</div>
              <div className="text-sm text-gray-600">Subcategories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalJobs}</div>
              <div className="text-sm text-gray-600">Services</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceQualityAnalysis;
