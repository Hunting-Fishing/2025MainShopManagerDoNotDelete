
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  Target,
  BarChart3,
  FileText,
  Layers
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

interface QualityMetrics {
  totalCategories: number;
  totalSubcategories: number;
  totalJobs: number;
  categoriesWithDescription: number;
  subcategoriesWithDescription: number;
  jobsWithDescription: number;
  jobsWithPrice: number;
  jobsWithEstimatedTime: number;
  averageJobsPerSubcategory: number;
  averageSubcategoriesPerCategory: number;
  completenessScore: number;
  qualityIssues: string[];
  recommendations: string[];
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const metrics = useMemo((): QualityMetrics => {
    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    const totalJobs = categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
    );

    const categoriesWithDescription = categories.filter(cat => cat.description?.trim()).length;
    const subcategoriesWithDescription = categories.reduce((sum, cat) =>
      sum + cat.subcategories.filter(sub => sub.description?.trim()).length, 0
    );

    let jobsWithDescription = 0;
    let jobsWithPrice = 0;
    let jobsWithEstimatedTime = 0;

    categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.jobs.forEach(job => {
          if (job.description?.trim()) jobsWithDescription++;
          if (job.price !== undefined && job.price > 0) jobsWithPrice++;
          if (job.estimatedTime?.trim()) jobsWithEstimatedTime++;
        });
      });
    });

    const averageJobsPerSubcategory = totalSubcategories > 0 ? totalJobs / totalSubcategories : 0;
    const averageSubcategoriesPerCategory = totalCategories > 0 ? totalSubcategories / totalCategories : 0;

    // Calculate completeness score (0-100)
    const categoryDescriptionScore = totalCategories > 0 ? (categoriesWithDescription / totalCategories) * 20 : 0;
    const subcategoryDescriptionScore = totalSubcategories > 0 ? (subcategoriesWithDescription / totalSubcategories) * 20 : 0;
    const jobDescriptionScore = totalJobs > 0 ? (jobsWithDescription / totalJobs) * 20 : 0;
    const jobPriceScore = totalJobs > 0 ? (jobsWithPrice / totalJobs) * 20 : 0;
    const jobTimeScore = totalJobs > 0 ? (jobsWithEstimatedTime / totalJobs) * 20 : 0;

    const completenessScore = categoryDescriptionScore + subcategoryDescriptionScore + 
                             jobDescriptionScore + jobPriceScore + jobTimeScore;

    // Identify quality issues
    const qualityIssues: string[] = [];
    const recommendations: string[] = [];

    if (categoriesWithDescription / totalCategories < 0.8) {
      qualityIssues.push(`${totalCategories - categoriesWithDescription} categories missing descriptions`);
      recommendations.push('Add descriptions to all categories for better organization');
    }

    if (totalSubcategories > 0 && subcategoriesWithDescription / totalSubcategories < 0.7) {
      qualityIssues.push(`${totalSubcategories - subcategoriesWithDescription} subcategories missing descriptions`);
      recommendations.push('Complete subcategory descriptions to improve clarity');
    }

    if (totalJobs > 0 && jobsWithPrice / totalJobs < 0.9) {
      qualityIssues.push(`${totalJobs - jobsWithPrice} jobs missing pricing information`);
      recommendations.push('Set prices for all jobs to enable accurate quoting');
    }

    if (totalJobs > 0 && jobsWithEstimatedTime / totalJobs < 0.8) {
      qualityIssues.push(`${totalJobs - jobsWithEstimatedTime} jobs missing time estimates`);
      recommendations.push('Add time estimates to improve scheduling accuracy');
    }

    if (averageJobsPerSubcategory < 2) {
      qualityIssues.push('Some subcategories have very few jobs');
      recommendations.push('Consider consolidating subcategories with few jobs');
    }

    if (averageJobsPerSubcategory > 10) {
      qualityIssues.push('Some subcategories are overcrowded with jobs');
      recommendations.push('Consider splitting large subcategories for better organization');
    }

    return {
      totalCategories,
      totalSubcategories,
      totalJobs,
      categoriesWithDescription,
      subcategoriesWithDescription,
      jobsWithDescription,
      jobsWithPrice,
      jobsWithEstimatedTime,
      averageJobsPerSubcategory,
      averageSubcategoriesPerCategory,
      completenessScore,
      qualityIssues,
      recommendations
    };
  }, [categories]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <Target className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overview Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Categories</span>
                <span className="font-medium">{metrics.totalCategories}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subcategories</span>
                <span className="font-medium">{metrics.totalSubcategories}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Jobs</span>
                <span className="font-medium">{metrics.totalJobs}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completeness Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getScoreColor(metrics.completenessScore)}`}>
                  {Math.round(metrics.completenessScore)}%
                </span>
                {getScoreIcon(metrics.completenessScore)}
              </div>
              <Progress value={metrics.completenessScore} className="h-2" />
              <p className="text-xs text-gray-600">
                Overall data completeness
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Organization Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg Jobs/Sub</span>
                <span className="font-medium">{metrics.averageJobsPerSubcategory.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Subs/Cat</span>
                <span className="font-medium">{metrics.averageSubcategoriesPerCategory.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">
                  {metrics.qualityIssues.length}
                </span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-xs text-gray-600">
                Quality issues found
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Completeness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Completeness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Category Descriptions</span>
                  <span>{metrics.categoriesWithDescription}/{metrics.totalCategories}</span>
                </div>
                <Progress value={(metrics.categoriesWithDescription / Math.max(metrics.totalCategories, 1)) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Subcategory Descriptions</span>
                  <span>{metrics.subcategoriesWithDescription}/{metrics.totalSubcategories}</span>
                </div>
                <Progress value={(metrics.subcategoriesWithDescription / Math.max(metrics.totalSubcategories, 1)) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Job Pricing</span>
                  <span>{metrics.jobsWithPrice}/{metrics.totalJobs}</span>
                </div>
                <Progress value={(metrics.jobsWithPrice / Math.max(metrics.totalJobs, 1)) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Time Estimates</span>
                  <span>{metrics.jobsWithEstimatedTime}/{metrics.totalJobs}</span>
                </div>
                <Progress value={(metrics.jobsWithEstimatedTime / Math.max(metrics.totalJobs, 1)) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues & Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Issues & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.qualityIssues.length > 0 ? (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-amber-700">Issues Found:</h4>
                  <ul className="space-y-1">
                    {metrics.qualityIssues.map((issue, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">No major issues found</span>
                </div>
              )}

              {metrics.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-blue-700">Recommendations:</h4>
                  <ul className="space-y-1">
                    {metrics.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceQualityAnalysis;
