
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { ServiceQualityMetrics, ServiceQualityData } from './ServiceQualityMetrics';
import DuplicateResolutionDialog, { DuplicateGroup } from './DuplicateResolutionDialog';
import { toast } from '@/hooks/use-toast';

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const [qualityData, setQualityData] = useState<ServiceQualityData | null>(null);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Mock data generation - in real implementation, this would come from analysis service
  const generateQualityData = (): ServiceQualityData => {
    const totalServices = categories.reduce((acc, cat) => 
      acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.jobs.length, 0), 0
    );
    
    const duplicateGroups = Math.floor(totalServices * 0.15); // Assume 15% have duplicates
    const duplicatePercentage = (duplicateGroups / totalServices) * 100;
    const categoriesWithDuplicates = Math.floor(categories.length * 0.6);
    const averageDuplicatesPerGroup = 2.3;
    const qualityScore = Math.max(20, 100 - duplicatePercentage * 2);

    return {
      totalServices,
      duplicateGroups,
      duplicatePercentage,
      categoriesWithDuplicates,
      averageDuplicatesPerGroup,
      qualityScore,
      trends: {
        duplicateChange: Math.random() * 10 - 5, // -5 to +5
        qualityScoreChange: Math.random() * 6 - 3 // -3 to +3
      }
    };
  };

  // Mock duplicate groups generation
  const generateDuplicateGroups = (): DuplicateGroup[] => {
    const groups: DuplicateGroup[] = [];
    
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        // Simulate finding duplicate groups
        if (Math.random() > 0.7) { // 30% chance of duplicates in subcategory
          const services = subcategory.jobs;
          if (services.length >= 2) {
            const groupSize = Math.min(services.length, Math.floor(Math.random() * 3) + 2);
            const selectedServices = services.slice(0, groupSize);
            
            groups.push({
              groupName: `${subcategory.name} Services`,
              services: selectedServices,
              category: category.name,
              subcategory: subcategory.name,
              confidence: Math.floor(Math.random() * 30) + 70 // 70-100% confidence
            });
          }
        }
      });
    });

    return groups.slice(0, 8); // Limit to 8 groups for demo
  };

  const analyzeQuality = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = generateQualityData();
      const duplicates = generateDuplicateGroups();
      
      setQualityData(data);
      setDuplicateGroups(duplicates);
      setAnalysisComplete(true);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${duplicates.length} duplicate groups affecting ${data.duplicatePercentage.toFixed(1)}% of services.`
      });
    } catch (error) {
      console.error('Error analyzing quality:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete quality analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResolveDuplicates = async (resolutions: any[]) => {
    // In real implementation, this would call the actual resolution service
    console.log('Resolving duplicates:', resolutions);
    
    // Simulate resolution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update data after resolution
    if (qualityData) {
      const resolvedGroups = resolutions.length;
      const newDuplicateGroups = Math.max(0, qualityData.duplicateGroups - resolvedGroups);
      const newDuplicatePercentage = (newDuplicateGroups / qualityData.totalServices) * 100;
      const newQualityScore = Math.min(100, 100 - newDuplicatePercentage * 2);
      
      setQualityData({
        ...qualityData,
        duplicateGroups: newDuplicateGroups,
        duplicatePercentage: newDuplicatePercentage,
        qualityScore: newQualityScore
      });
      
      // Remove resolved groups
      const resolvedGroupNames = new Set(resolutions.map(r => r.groupName));
      setDuplicateGroups(prev => prev.filter(group => !resolvedGroupNames.has(group.groupName)));
    }
    
    onRefresh();
  };

  useEffect(() => {
    if (categories.length > 0 && !qualityData) {
      analyzeQuality();
    }
  }, [categories]);

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default" as const;
    if (score >= 60) return "secondary" as const;
    return "destructive" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Service Quality Analysis</h3>
          <p className="text-gray-600">Analyze and improve your service hierarchy quality</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={analyzeQuality}
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </Button>
          {duplicateGroups.length > 0 && (
            <Button
              onClick={() => setShowResolutionDialog(true)}
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Resolve Duplicates ({duplicateGroups.length})
            </Button>
          )}
        </div>
      </div>

      {isAnalyzing && !qualityData && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Service Quality</h3>
              <p className="text-gray-600">This may take a few moments...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {qualityData && (
        <>
          <ServiceQualityMetrics data={qualityData} />

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="duplicates">
                Duplicates
                {duplicateGroups.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {duplicateGroups.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Quality Score Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Quality</span>
                      <Badge variant={getQualityScoreBadgeVariant(qualityData.qualityScore)}>
                        {qualityData.qualityScore}%
                      </Badge>
                    </div>
                    <Progress value={qualityData.qualityScore} className="h-2" />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duplicate Rate:</span>
                        <span className="font-medium">{qualityData.duplicatePercentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Affected Categories:</span>
                        <span className="font-medium">{qualityData.categoriesWithDuplicates}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Recent Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Quality Score Change</span>
                      <span className={`font-medium ${qualityData.trends.qualityScoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {qualityData.trends.qualityScoreChange >= 0 ? '+' : ''}{qualityData.trends.qualityScoreChange.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Duplicate Change</span>
                      <span className={`font-medium ${qualityData.trends.duplicateChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {qualityData.trends.duplicateChange >= 0 ? '+' : ''}{qualityData.trends.duplicateChange.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="duplicates" className="space-y-4">
              {duplicateGroups.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Detected Duplicate Groups</h4>
                    <Button onClick={() => setShowResolutionDialog(true)}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Resolve All Duplicates
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {duplicateGroups.slice(0, 5).map((group, index) => (
                      <Card key={index} className="border-l-4 border-l-amber-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{group.groupName}</CardTitle>
                            <Badge variant="secondary">{group.confidence}% match</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{group.category}</Badge>
                            <span className="text-gray-400">→</span>
                            <Badge variant="outline">{group.subcategory}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            {group.services.map((service, serviceIndex) => (
                              <div key={serviceIndex} className="text-sm p-2 bg-gray-50 rounded">
                                <span className="font-medium">{service.name}</span>
                                {service.description && (
                                  <p className="text-gray-600 mt-1">{service.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {duplicateGroups.length > 5 && (
                      <Card className="border-dashed">
                        <CardContent className="text-center py-6">
                          <p className="text-gray-600">
                            +{duplicateGroups.length - 5} more duplicate groups
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setShowResolutionDialog(true)}
                          >
                            View All Duplicates
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Duplicates Found</h3>
                    <p className="text-gray-600">Your service hierarchy looks clean!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Quick Wins
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Merge similar services</p>
                        <p className="text-sm text-gray-600">Combine services with similar names and descriptions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Standardize naming conventions</p>
                        <p className="text-sm text-gray-600">Use consistent terminology across all categories</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Review category placement</p>
                        <p className="text-sm text-gray-600">Ensure services are in the most appropriate categories</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      <DuplicateResolutionDialog
        isOpen={showResolutionDialog}
        onClose={() => setShowResolutionDialog(false)}
        duplicateGroups={duplicateGroups}
        categories={categories}
        onResolveDuplicates={handleResolveDuplicates}
      />
    </div>
  );
};

export default ServiceQualityAnalysis;
