
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { ServiceQualityMetrics, ServiceQualityData } from './ServiceQualityMetrics';
import { DuplicateSearchButton } from './DuplicateSearchButton';
import { 
  findServiceDuplicates, 
  DuplicateItem,
  defaultSearchOptions
} from '@/utils/search/duplicateSearch';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // Calculate quality metrics
  const qualityData = useMemo((): ServiceQualityData => {
    const totalServices = categories.reduce((total, category) => {
      return total + category.subcategories.reduce((subTotal, subcategory) => {
        return subTotal + subcategory.jobs.length;
      }, 0);
    }, 0);

    const duplicateGroups = duplicates.length;
    const duplicateItems = duplicates.reduce((total, duplicate) => total + duplicate.occurrences.length, 0);
    const duplicatePercentage = totalServices > 0 ? (duplicateItems / totalServices) * 100 : 0;

    const categoriesWithDuplicates = new Set(
      duplicates.flatMap(duplicate => 
        duplicate.occurrences.map(occ => occ.categoryName).filter(Boolean)
      )
    ).size;

    const averageDuplicatesPerGroup = duplicateGroups > 0 ? duplicateItems / duplicateGroups : 0;

    // Quality score calculation (100 - duplicate percentage, with adjustments)
    let qualityScore = Math.max(0, Math.min(100, 100 - duplicatePercentage));
    
    // Adjust for severity of duplicates
    const exactDuplicates = duplicates.filter(d => d.matchType === 'exact').length;
    const exactWordsMatches = duplicates.filter(d => d.matchType === 'exact_words').length;
    
    qualityScore -= exactDuplicates * 2; // Exact duplicates are worse
    qualityScore -= exactWordsMatches * 1.5; // Exact word matches are also bad
    qualityScore = Math.max(0, qualityScore);

    // Mock trend data (in real app, this would come from historical data)
    const trends = {
      duplicateChange: -5, // 5% decrease in duplicates (improvement)
      qualityScoreChange: 8 // 8% increase in quality score
    };

    return {
      totalServices,
      duplicateGroups,
      duplicatePercentage,
      categoriesWithDuplicates,
      averageDuplicatesPerGroup,
      qualityScore,
      trends
    };
  }, [categories, duplicates]);

  const runAnalysis = () => {
    console.log('Running quality analysis...');
    const foundDuplicates = findServiceDuplicates(categories, defaultSearchOptions);
    setDuplicates(foundDuplicates);
    setLastAnalysis(new Date());
  };

  // Auto-run analysis when categories change
  React.useEffect(() => {
    if (categories.length > 0) {
      runAnalysis();
    }
  }, [categories]);

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 60) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 40) return { label: 'Poor', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Critical', color: 'bg-red-100 text-red-800' };
  };

  const categoryAnalysis = useMemo(() => {
    return categories.map(category => {
      const categoryDuplicates = duplicates.filter(duplicate =>
        duplicate.occurrences.some(occ => occ.categoryName === category.name)
      );

      const totalJobs = category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0);
      const duplicateCount = categoryDuplicates.reduce((total, dup) => 
        total + dup.occurrences.filter(occ => occ.categoryName === category.name).length, 0
      );

      const duplicateRate = totalJobs > 0 ? (duplicateCount / totalJobs) * 100 : 0;

      return {
        category: category.name,
        totalJobs,
        duplicateGroups: categoryDuplicates.length,
        duplicateCount,
        duplicateRate,
        qualityScore: Math.max(0, 100 - duplicateRate)
      };
    }).sort((a, b) => b.duplicateRate - a.duplicateRate);
  }, [categories, duplicates]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Quality Analysis</h2>
          <p className="text-gray-600">
            Analyze service data quality and identify improvement opportunities
          </p>
          {lastAnalysis && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastAnalysis.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={runAnalysis} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
          <DuplicateSearchButton 
            categories={categories} 
            onCategoriesUpdated={onRefresh}
          />
        </div>
      </div>

      {/* Quality Metrics Overview */}
      <ServiceQualityMetrics data={qualityData} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicate Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quality Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Quality</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getQualityScoreColor(qualityData.qualityScore)}`}>
                        {qualityData.qualityScore.toFixed(0)}%
                      </span>
                      <Badge className={getQualityScoreBadge(qualityData.qualityScore).color}>
                        {getQualityScoreBadge(qualityData.qualityScore).label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Services without duplicates:</span>
                      <span className="font-medium">
                        {(100 - qualityData.duplicatePercentage).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clean categories:</span>
                      <span className="font-medium">
                        {categories.length - qualityData.categoriesWithDuplicates} of {categories.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg duplicates per group:</span>
                      <span className="font-medium">
                        {qualityData.averageDuplicatesPerGroup.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {qualityData.duplicateGroups === 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>No duplicate groups found</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{qualityData.duplicateGroups} duplicate groups detected</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{qualityData.categoriesWithDuplicates} categories affected</span>
                      </div>
                    </>
                  )}
                  
                  {/* Show specific issues */}
                  {duplicates.filter(d => d.matchType === 'exact').length > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        {duplicates.filter(d => d.matchType === 'exact').length} exact duplicate(s) found
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryAnalysis.map((analysis) => (
                  <div key={analysis.category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{analysis.category}</div>
                      <div className="text-sm text-gray-600">
                        {analysis.totalJobs} services, {analysis.duplicateGroups} duplicate groups
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`font-medium ${getQualityScoreColor(analysis.qualityScore)}`}>
                          {analysis.qualityScore.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {analysis.duplicateRate.toFixed(1)}% duplicates
                        </div>
                      </div>
                      <Badge 
                        variant={analysis.duplicateGroups === 0 ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {analysis.duplicateGroups === 0 ? "Clean" : `${analysis.duplicateGroups} issues`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Groups Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {duplicates.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Duplicates Found</h3>
                  <p className="text-gray-600">Your service catalog appears to be clean!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {duplicates.slice(0, 10).map((duplicate) => (
                    <div key={duplicate.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">"{duplicate.text}"</div>
                        <div className="text-sm text-gray-600">
                          {duplicate.occurrences.length} occurrences in {new Set(duplicate.occurrences.map(o => o.categoryName)).size} categories
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          duplicate.matchType === 'exact' ? 'bg-red-100 text-red-800' :
                          duplicate.matchType === 'exact_words' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {duplicate.matchType.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {duplicate.similarity}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {duplicates.length > 10 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      And {duplicates.length - 10} more duplicate groups...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceQualityAnalysis;
