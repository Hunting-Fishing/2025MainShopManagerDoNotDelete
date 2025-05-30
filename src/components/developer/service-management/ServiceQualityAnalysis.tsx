
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { AlertTriangle, CheckCircle, TrendingUp, Target } from 'lucide-react';

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const qualityMetrics = useMemo(() => {
    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    const totalJobs = categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
    );

    // Categories with missing descriptions
    const categoriesWithoutDesc = categories.filter(cat => !cat.description?.trim()).length;
    
    // Subcategories with missing descriptions
    const subcategoriesWithoutDesc = categories.reduce((sum, cat) => 
      sum + cat.subcategories.filter(sub => !sub.description?.trim()).length, 0
    );

    // Jobs with missing data
    const jobsWithoutDesc = categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => 
        subSum + sub.jobs.filter(job => !job.description?.trim()).length, 0
      ), 0
    );

    const jobsWithoutPrice = categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => 
        subSum + sub.jobs.filter(job => !job.price || job.price <= 0).length, 0
      ), 0
    );

    const jobsWithoutTime = categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => 
        subSum + sub.jobs.filter(job => !job.estimatedTime || job.estimatedTime <= 0).length, 0
      ), 0
    );

    // Calculate completion percentages
    const categoryCompleteness = totalCategories > 0 ? 
      ((totalCategories - categoriesWithoutDesc) / totalCategories) * 100 : 100;
    
    const subcategoryCompleteness = totalSubcategories > 0 ? 
      ((totalSubcategories - subcategoriesWithoutDesc) / totalSubcategories) * 100 : 100;
    
    const jobCompleteness = totalJobs > 0 ? 
      ((totalJobs - jobsWithoutDesc - jobsWithoutPrice - jobsWithoutTime) / totalJobs) * 100 : 100;

    // Overall quality score
    const overallQuality = (categoryCompleteness + subcategoryCompleteness + jobCompleteness) / 3;

    return {
      totalCategories,
      totalSubcategories,
      totalJobs,
      categoriesWithoutDesc,
      subcategoriesWithoutDesc,
      jobsWithoutDesc,
      jobsWithoutPrice,
      jobsWithoutTime,
      categoryCompleteness,
      subcategoryCompleteness,
      jobCompleteness,
      overallQuality
    };
  }, [categories]);

  const getQualityBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (score >= 50) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Quality Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Quality</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(qualityMetrics.overallQuality)}%</div>
            <div className="mt-2">{getQualityBadge(qualityMetrics.overallQuality)}</div>
            <Progress value={qualityMetrics.overallQuality} className="mt-3" />
          </CardContent>
        </Card>

        {/* Category Completeness */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(qualityMetrics.categoryCompleteness)}%</div>
            <p className="text-xs text-muted-foreground">
              {qualityMetrics.categoriesWithoutDesc} missing descriptions
            </p>
            <Progress value={qualityMetrics.categoryCompleteness} className="mt-3" />
          </CardContent>
        </Card>

        {/* Subcategory Completeness */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(qualityMetrics.subcategoryCompleteness)}%</div>
            <p className="text-xs text-muted-foreground">
              {qualityMetrics.subcategoriesWithoutDesc} missing descriptions
            </p>
            <Progress value={qualityMetrics.subcategoryCompleteness} className="mt-3" />
          </CardContent>
        </Card>

        {/* Job Completeness */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(qualityMetrics.jobCompleteness)}%</div>
            <p className="text-xs text-muted-foreground">
              {qualityMetrics.jobsWithoutDesc + qualityMetrics.jobsWithoutPrice + qualityMetrics.jobsWithoutTime} incomplete
            </p>
            <Progress value={qualityMetrics.jobCompleteness} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityMetrics.jobsWithoutDesc > 0 && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Jobs Missing Descriptions</h4>
                  <p className="text-sm text-muted-foreground">
                    {qualityMetrics.jobsWithoutDesc} jobs need descriptions for better clarity
                  </p>
                </div>
                <Badge variant="outline">{qualityMetrics.jobsWithoutDesc}</Badge>
              </div>
            )}

            {qualityMetrics.jobsWithoutPrice > 0 && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Jobs Missing Pricing</h4>
                  <p className="text-sm text-muted-foreground">
                    {qualityMetrics.jobsWithoutPrice} jobs need price information
                  </p>
                </div>
                <Badge variant="outline">{qualityMetrics.jobsWithoutPrice}</Badge>
              </div>
            )}

            {qualityMetrics.jobsWithoutTime > 0 && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Jobs Missing Time Estimates</h4>
                  <p className="text-sm text-muted-foreground">
                    {qualityMetrics.jobsWithoutTime} jobs need estimated time information
                  </p>
                </div>
                <Badge variant="outline">{qualityMetrics.jobsWithoutTime}</Badge>
              </div>
            )}

            {qualityMetrics.overallQuality >= 90 && (
              <div className="flex items-center justify-center p-6 border rounded-lg bg-green-50">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-green-800">Excellent Data Quality!</h4>
                  <p className="text-sm text-green-600">Your service hierarchy is well-organized and complete.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceQualityAnalysis;
