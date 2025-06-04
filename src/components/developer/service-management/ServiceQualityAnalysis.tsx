
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  FileText,
  DollarSign,
  Clock
} from 'lucide-react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

interface QualityMetric {
  id: string;
  name: string;
  description: string;
  score: number;
  status: 'good' | 'warning' | 'error';
  details: string[];
  count: number;
}

export default function ServiceQualityAnalysis({ 
  categories, 
  onRefresh 
}: ServiceQualityAnalysisProps) {
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    analyzeQuality();
  }, [categories]);

  const analyzeQuality = () => {
    setLoading(true);
    
    // Get all jobs with context
    const allJobs: (ServiceJob & { categoryName: string; subcategoryName: string })[] = [];
    
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          allJobs.push({
            ...job,
            categoryName: category.name,
            subcategoryName: subcategory.name
          });
        });
      });
    });

    const qualityMetrics: QualityMetric[] = [];

    // 1. Jobs with descriptions
    const jobsWithDescriptions = allJobs.filter(job => job.description && job.description.trim().length > 0);
    const descriptionScore = allJobs.length > 0 ? (jobsWithDescriptions.length / allJobs.length) * 100 : 100;
    
    qualityMetrics.push({
      id: 'descriptions',
      name: 'Job Descriptions',
      description: 'Percentage of jobs with meaningful descriptions',
      score: Math.round(descriptionScore),
      status: descriptionScore >= 80 ? 'good' : descriptionScore >= 60 ? 'warning' : 'error',
      details: [
        `${jobsWithDescriptions.length} of ${allJobs.length} jobs have descriptions`,
        descriptionScore < 80 ? 'Consider adding descriptions to improve clarity' : 'Good description coverage'
      ],
      count: jobsWithDescriptions.length
    });

    // 2. Jobs with pricing
    const jobsWithPricing = allJobs.filter(job => job.price && job.price > 0);
    const pricingScore = allJobs.length > 0 ? (jobsWithPricing.length / allJobs.length) * 100 : 100;
    
    qualityMetrics.push({
      id: 'pricing',
      name: 'Job Pricing',
      description: 'Percentage of jobs with price information',
      score: Math.round(pricingScore),
      status: pricingScore >= 90 ? 'good' : pricingScore >= 70 ? 'warning' : 'error',
      details: [
        `${jobsWithPricing.length} of ${allJobs.length} jobs have pricing`,
        pricingScore < 90 ? 'Missing prices may affect quoting accuracy' : 'Excellent pricing coverage'
      ],
      count: jobsWithPricing.length
    });

    // 3. Jobs with time estimates
    const jobsWithTime = allJobs.filter(job => job.estimatedTime && job.estimatedTime > 0);
    const timeScore = allJobs.length > 0 ? (jobsWithTime.length / allJobs.length) * 100 : 100;
    
    qualityMetrics.push({
      id: 'timing',
      name: 'Time Estimates',
      description: 'Percentage of jobs with time estimates',
      score: Math.round(timeScore),
      status: timeScore >= 85 ? 'good' : timeScore >= 65 ? 'warning' : 'error',
      details: [
        `${jobsWithTime.length} of ${allJobs.length} jobs have time estimates`,
        timeScore < 85 ? 'Time estimates help with scheduling and planning' : 'Good time estimate coverage'
      ],
      count: jobsWithTime.length
    });

    // 4. Category distribution
    const categoryDistribution = categories.map(cat => ({
      name: cat.name,
      jobCount: cat.subcategories.reduce((sum, sub) => sum + sub.jobs.length, 0)
    }));
    
    const avgJobsPerCategory = allJobs.length / categories.length;
    const unevenDistribution = categoryDistribution.some(cat => 
      cat.jobCount < avgJobsPerCategory * 0.1 || cat.jobCount > avgJobsPerCategory * 5
    );
    
    qualityMetrics.push({
      id: 'distribution',
      name: 'Category Balance',
      description: 'Even distribution of jobs across categories',
      score: unevenDistribution ? 60 : 95,
      status: unevenDistribution ? 'warning' : 'good',
      details: [
        `${categories.length} categories with average ${Math.round(avgJobsPerCategory)} jobs each`,
        unevenDistribution ? 'Some categories have very few or too many jobs' : 'Well-balanced category distribution'
      ],
      count: categories.length
    });

    // 5. Naming consistency
    const namesWithNumbers = allJobs.filter(job => /\d/.test(job.name));
    const namesWithSpecialChars = allJobs.filter(job => /[^\w\s-]/.test(job.name));
    const inconsistentNaming = namesWithNumbers.length + namesWithSpecialChars.length;
    const namingScore = allJobs.length > 0 ? ((allJobs.length - inconsistentNaming) / allJobs.length) * 100 : 100;
    
    qualityMetrics.push({
      id: 'naming',
      name: 'Naming Consistency',
      description: 'Consistent naming conventions across jobs',
      score: Math.round(namingScore),
      status: namingScore >= 90 ? 'good' : namingScore >= 75 ? 'warning' : 'error',
      details: [
        `${Math.round(namingScore)}% of job names follow consistent patterns`,
        inconsistentNaming > 0 ? `${inconsistentNaming} jobs may need name cleanup` : 'Excellent naming consistency'
      ],
      count: allJobs.length - inconsistentNaming
    });

    setMetrics(qualityMetrics);
    
    // Calculate overall score
    const totalScore = qualityMetrics.reduce((sum, metric) => sum + metric.score, 0);
    const avgScore = totalScore / qualityMetrics.length;
    setOverallScore(Math.round(avgScore));
    
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing service quality...</p>
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
            Overall Quality Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <p className="text-muted-foreground">Service hierarchy quality</p>
            </div>
            <div className="text-right">
              <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
          <Progress value={overallScore} className="w-full" />
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map(metric => (
          <Card key={metric.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  {metric.name}
                </CardTitle>
                <div className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {metric.description}
              </p>
              <div className="space-y-2">
                {metric.details.map((detail, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    {detail}
                  </p>
                ))}
              </div>
              <Progress value={metric.score} className="w-full mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">
                    {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Subcategories</div>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">
                    {categories.reduce((sum, cat) => 
                      sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {metrics
              .filter(metric => metric.status !== 'good')
              .map(metric => (
                <Alert key={metric.id}>
                  {getStatusIcon(metric.status)}
                  <AlertDescription>
                    <strong>{metric.name}:</strong> {metric.details[1]}
                  </AlertDescription>
                </Alert>
              ))}
            
            {metrics.every(metric => metric.status === 'good') && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Excellent! Your service hierarchy meets all quality standards.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          {metrics.map(metric => (
            <Card key={metric.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  {metric.name} - {metric.score}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{metric.description}</p>
                <div className="space-y-2">
                  {metric.details.map((detail, index) => (
                    <p key={index} className="text-sm">
                      {detail}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
