import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Users, Search, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DuplicateResolutionDialog from './DuplicateResolutionDialog';
import { ServiceQualityMetrics } from './ServiceQualityMetrics';
import { getCategoryColor, findServiceCategory } from '@/utils/automotive/serviceTaxonomy';
import { toast } from 'sonner';

interface QualityIssue {
  type: 'duplicate' | 'inconsistent_pricing' | 'missing_category' | 'poor_description';
  severity: 'low' | 'medium' | 'high';
  count: number;
  description: string;
  affectedServices: string[];
}

interface ServiceQualityData {
  totalServices: number;
  issues: QualityIssue[];
  duplicateGroups: DuplicateGroup[];
  qualityScore: number;
  categories: ServiceCategory[];
}

interface DuplicateGroup {
  groupName: string;
  services: Array<{
    id: string;
    name: string;
    category?: string;
    subcategory?: string;
    price?: number;
    estimatedTime?: number;
    description?: string;
  }>;
  similarity: number;
  issues: string[];
}

interface ServiceCategory {
  id: string;
  name: string;
  subcategories?: Array<{ id: string; name: string }>;
}

interface ResolutionAction {
  groupName: string;
  action: 'merge' | 'move' | 'delete';
  targetCategoryId?: string;
  targetSubcategoryId?: string;
  selectedServices?: string[];
}

export const ServiceQualityAnalysis: React.FC = () => {
  const [qualityData, setQualityData] = useState<ServiceQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzeServiceQuality();
  }, []);

  const analyzeServiceQuality = async () => {
    setIsAnalyzing(true);
    try {
      // Fetch services and categories
      const { data: services, error: servicesError } = await supabase
        .from('service_hierarchy')
        .select('*');

      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select(`
          id,
          name,
          service_subcategories (
            id,
            name
          )
        `);

      if (servicesError || categoriesError) {
        throw new Error('Failed to fetch data');
      }

      // Analyze duplicates and issues
      const duplicateGroups = findDuplicateServices(services || []);
      const issues = analyzeQualityIssues(services || [], duplicateGroups);
      const qualityScore = calculateQualityScore(services?.length || 0, issues);

      const formattedCategories: ServiceCategory[] = (categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        subcategories: cat.service_subcategories?.map((sub: any) => ({
          id: sub.id,
          name: sub.name
        })) || []
      }));

      setQualityData({
        totalServices: services?.length || 0,
        issues,
        duplicateGroups,
        qualityScore,
        categories: formattedCategories
      });

    } catch (error) {
      console.error('Error analyzing service quality:', error);
      toast.error('Failed to analyze service quality');
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  };

  const findDuplicateServices = (services: any[]): DuplicateGroup[] => {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    services.forEach((service, index) => {
      if (processed.has(service.id)) return;

      const duplicates = services.filter((other, otherIndex) => 
        otherIndex !== index && 
        !processed.has(other.id) &&
        calculateSimilarity(service.name, other.name) > 0.7
      );

      if (duplicates.length > 0) {
        const allServices = [service, ...duplicates];
        const groupName = `${service.name} variants`;
        
        // Mark all as processed
        allServices.forEach(s => processed.add(s.id));

        const issues = analyzeGroupIssues(allServices);
        const similarity = Math.min(...duplicates.map(d => calculateSimilarity(service.name, d.name)));

        groups.push({
          groupName,
          services: allServices.map(s => ({
            id: s.id,
            name: s.name,
            category: s.category_name,
            subcategory: s.subcategory_name,
            price: s.price,
            estimatedTime: s.estimated_time,
            description: s.description
          })),
          similarity,
          issues
        });
      }
    });

    return groups;
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalized1 = normalize(str1);
    const normalized2 = normalize(str2);
    
    if (normalized1 === normalized2) return 1.0;
    
    // Simple similarity based on common words
    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  const analyzeGroupIssues = (services: any[]): string[] => {
    const issues: string[] = [];
    
    const prices = services.filter(s => s.price).map(s => s.price);
    if (prices.length > 1) {
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      if ((maxPrice - minPrice) / minPrice > 0.2) {
        issues.push('Inconsistent pricing');
      }
    }

    const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
    if (categories.length > 1) {
      issues.push('Different categories');
    }

    const descriptions = services.filter(s => s.description);
    if (descriptions.length < services.length) {
      issues.push('Missing descriptions');
    }

    return issues;
  };

  const analyzeQualityIssues = (services: any[], duplicateGroups: DuplicateGroup[]): QualityIssue[] => {
    const issues: QualityIssue[] = [];

    // Duplicate services
    if (duplicateGroups.length > 0) {
      const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.services.length, 0);
      issues.push({
        type: 'duplicate',
        severity: 'high',
        count: totalDuplicates,
        description: `${duplicateGroups.length} groups of duplicate services found`,
        affectedServices: duplicateGroups.flatMap(g => g.services.map(s => s.id))
      });
    }

    // Missing categories
    const uncategorized = services.filter(s => !s.category_id);
    if (uncategorized.length > 0) {
      issues.push({
        type: 'missing_category',
        severity: 'medium',
        count: uncategorized.length,
        description: `${uncategorized.length} services without categories`,
        affectedServices: uncategorized.map(s => s.id)
      });
    }

    // Poor descriptions
    const poorDescriptions = services.filter(s => !s.description || s.description.length < 20);
    if (poorDescriptions.length > 0) {
      issues.push({
        type: 'poor_description',
        severity: 'low',
        count: poorDescriptions.length,
        description: `${poorDescriptions.length} services with poor descriptions`,
        affectedServices: poorDescriptions.map(s => s.id)
      });
    }

    return issues;
  };

  const calculateQualityScore = (totalServices: number, issues: QualityIssue[]): number => {
    if (totalServices === 0) return 100;

    const weights = { high: 10, medium: 5, low: 2 };
    const totalDeductions = issues.reduce((sum, issue) => {
      return sum + (issue.count * weights[issue.severity]);
    }, 0);

    const maxPossibleDeductions = totalServices * weights.high;
    const score = Math.max(0, 100 - ((totalDeductions / maxPossibleDeductions) * 100));
    
    return Math.round(score);
  };

  const handleResolveDuplicates = async (actions: ResolutionAction[]) => {
    try {
      for (const action of actions) {
        if (action.action === 'merge') {
          // Implement merge logic
          await mergeDuplicateServices(action.selectedServices || []);
        } else if (action.action === 'move') {
          // Implement move logic
          await moveServicesToCategory(action.selectedServices || [], action.targetCategoryId!, action.targetSubcategoryId);
        } else if (action.action === 'delete') {
          // Implement delete logic
          await deleteServices(action.selectedServices || []);
        }
      }
      
      // Refresh the analysis
      await analyzeServiceQuality();
      toast.success('Duplicate resolution completed');
    } catch (error) {
      console.error('Error resolving duplicates:', error);
      throw error;
    }
  };

  const mergeDuplicateServices = async (serviceIds: string[]) => {
    // Implementation for merging services
    console.log('Merging services:', serviceIds);
  };

  const moveServicesToCategory = async (serviceIds: string[], categoryId: string, subcategoryId?: string) => {
    // Implementation for moving services
    console.log('Moving services:', serviceIds, 'to category:', categoryId, 'subcategory:', subcategoryId);
  };

  const deleteServices = async (serviceIds: string[]) => {
    // Implementation for deleting services
    console.log('Deleting services:', serviceIds);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Analyzing service quality...</p>
        </div>
      </div>
    );
  }

  if (!qualityData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load service quality data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quality Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Service Quality Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your service catalog quality and consistency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(qualityData.qualityScore)}`}>
                {qualityData.qualityScore}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Quality Score</p>
              <Progress value={qualityData.qualityScore} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {qualityData.totalServices}
              </div>
              <p className="text-sm text-gray-500 mt-1">Total Services</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {qualityData.issues.length}
              </div>
              <p className="text-sm text-gray-500 mt-1">Issues Found</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {qualityData.duplicateGroups.length}
              </div>
              <p className="text-sm text-gray-500 mt-1">Duplicate Groups</p>
            </div>
          </div>
          
          <div className="mt-6 flex gap-2">
            <Button onClick={analyzeServiceQuality} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
            {qualityData.duplicateGroups.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setShowDuplicateDialog(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Resolve Duplicates ({qualityData.duplicateGroups.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Quality Issues</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          {qualityData.issues.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Quality Issues Found</h3>
                  <p className="text-gray-500">Your service catalog is in excellent condition!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {qualityData.issues.map((issue, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <h3 className="font-medium">{issue.description}</h3>
                        <Badge variant={getSeverityColor(issue.severity) as any}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <span className="text-2xl font-bold text-gray-600">
                        {issue.count}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Affects {issue.affectedServices.length} services
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          {qualityData.duplicateGroups.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Duplicates Found</h3>
                  <p className="text-gray-500">All services appear to be unique!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {qualityData.duplicateGroups.map((group, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{group.groupName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {Math.round(group.similarity * 100)}% similar
                        </Badge>
                        <Badge variant="secondary">
                          {group.services.length} services
                        </Badge>
                      </div>
                    </div>
                    {group.issues.length > 0 && (
                      <CardDescription>
                        Issues: {group.issues.join(', ')}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.services.map((service) => (
                        <div 
                          key={service.id} 
                          className="border rounded-lg p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{service.name}</span>
                            {service.category && (
                              <Badge 
                                className={getCategoryColor(service.name)} 
                                variant="outline"
                              >
                                {service.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            {service.price && (
                              <div>Price: ${service.price}</div>
                            )}
                            {service.estimatedTime && (
                              <div>Time: {service.estimatedTime}min</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-center">
                <Button onClick={() => setShowDuplicateDialog(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Resolve All Duplicates
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics">
          <ServiceQualityMetrics data={qualityData} />
        </TabsContent>
      </Tabs>

      {/* Duplicate Resolution Dialog */}
      <DuplicateResolutionDialog
        isOpen={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
        duplicateGroups={qualityData.duplicateGroups}
        categories={qualityData.categories}
        onResolve={handleResolveDuplicates}
      />
    </div>
  );
};

export default ServiceQualityAnalysis;
