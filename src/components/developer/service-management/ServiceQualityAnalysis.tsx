
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  TrendingUp,
  RefreshCw,
  Copy,
  ArrowRight,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface QualityIssue {
  id: string;
  type: 'duplicate' | 'misplaced' | 'naming' | 'structure';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  items: {
    id: string;
    name: string;
    path: string;
    category?: string;
    subcategory?: string;
  }[];
  recommendation: string;
  autoFixable: boolean;
}

interface Enhancement {
  id: string;
  type: 'organization' | 'naming' | 'pricing' | 'coverage';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  recommendation: string;
  benefits: string[];
}

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [activeTab, setActiveTab] = useState('issues');

  const analyzeServiceHierarchy = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const foundIssues: QualityIssue[] = [];
      const foundEnhancements: Enhancement[] = [];
      
      // Analyze duplicates
      const duplicateMap = new Map<string, { id: string; name: string; path: string }[]>();
      
      categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          subcategory.jobs.forEach(job => {
            const key = job.name.toLowerCase().trim();
            if (!duplicateMap.has(key)) {
              duplicateMap.set(key, []);
            }
            duplicateMap.get(key)?.push({
              id: job.id,
              name: job.name,
              path: `${category.name} > ${subcategory.name} > ${job.name}`
            });
          });
        });
      });
      
      // Find actual duplicates
      duplicateMap.forEach((items, name) => {
        if (items.length > 1) {
          foundIssues.push({
            id: `duplicate-${name}`,
            type: 'duplicate',
            severity: 'high',
            title: `Duplicate Service: "${items[0].name}"`,
            description: `Found ${items.length} identical services across different categories`,
            items: items,
            recommendation: 'Consolidate these services into a single category or rename them to be more specific',
            autoFixable: false
          });
        }
      });
      
      // Analyze naming patterns
      const namingIssues: QualityIssue[] = [];
      categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          subcategory.jobs.forEach(job => {
            // Check for overly generic names
            const genericTerms = ['service', 'repair', 'check', 'basic', 'standard'];
            if (genericTerms.some(term => job.name.toLowerCase().includes(term)) && job.name.split(' ').length <= 2) {
              namingIssues.push({
                id: `naming-${job.id}`,
                type: 'naming',
                severity: 'medium',
                title: `Generic Service Name: "${job.name}"`,
                description: 'Service name is too generic and may confuse customers',
                items: [{
                  id: job.id,
                  name: job.name,
                  path: `${category.name} > ${subcategory.name} > ${job.name}`
                }],
                recommendation: 'Make the service name more specific and descriptive',
                autoFixable: false
              });
            }
          });
        });
      });
      
      foundIssues.push(...namingIssues.slice(0, 3)); // Limit to first 3 naming issues
      
      // Analyze structure issues
      categories.forEach(category => {
        if (category.subcategories.length === 0) {
          foundIssues.push({
            id: `empty-category-${category.id}`,
            type: 'structure',
            severity: 'medium',
            title: `Empty Category: "${category.name}"`,
            description: 'Category has no subcategories or services',
            items: [{
              id: category.id,
              name: category.name,
              path: category.name
            }],
            recommendation: 'Add services to this category or consider removing it',
            autoFixable: false
          });
        }
        
        category.subcategories.forEach(subcategory => {
          if (subcategory.jobs.length === 0) {
            foundIssues.push({
              id: `empty-subcategory-${subcategory.id}`,
              type: 'structure',
              severity: 'low',
              title: `Empty Subcategory: "${subcategory.name}"`,
              description: 'Subcategory has no services',
              items: [{
                id: subcategory.id,
                name: subcategory.name,
                path: `${category.name} > ${subcategory.name}`
              }],
              recommendation: 'Add services to this subcategory or merge it with another',
              autoFixable: false
            });
          }
        });
      });
      
      // Generate enhancement recommendations
      foundEnhancements.push({
        id: 'pricing-standardization',
        type: 'pricing',
        title: 'Standardize Service Pricing',
        description: 'Many services lack consistent pricing structure',
        impact: 'high',
        effort: 'medium',
        recommendation: 'Establish pricing tiers and ensure all services have appropriate prices',
        benefits: ['Improved customer experience', 'Faster quoting', 'Better profit margins']
      });
      
      foundEnhancements.push({
        id: 'category-reorganization',
        type: 'organization',
        title: 'Optimize Category Structure',
        description: 'Some categories could be better organized for customer navigation',
        impact: 'medium',
        effort: 'high',
        recommendation: 'Group related services together and create more intuitive category names',
        benefits: ['Easier service discovery', 'Reduced customer confusion', 'Improved conversion rates']
      });
      
      foundEnhancements.push({
        id: 'service-descriptions',
        type: 'naming',
        title: 'Enhance Service Descriptions',
        description: 'Many services lack detailed descriptions',
        impact: 'medium',
        effort: 'low',
        recommendation: 'Add clear, customer-friendly descriptions to all services',
        benefits: ['Better customer understanding', 'Reduced support inquiries', 'Higher confidence in booking']
      });
      
      setIssues(foundIssues);
      setEnhancements(foundEnhancements);
      
      toast.success(`Analysis complete: Found ${foundIssues.length} issues and ${foundEnhancements.length} enhancement opportunities`);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze service hierarchy');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0) {
      analyzeServiceHierarchy();
    }
  }, [categories]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Service Quality Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No service data available for analysis. Please import or create service categories first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Service Quality Analysis
            </CardTitle>
            <Button 
              onClick={analyzeServiceHierarchy} 
              disabled={isAnalyzing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">Issues Found</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{issues.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Enhancements</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{enhancements.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Categories</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{categories.length}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="issues" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Issues ({issues.length})
              </TabsTrigger>
              <TabsTrigger value="enhancements" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Enhancements ({enhancements.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4 mt-6">
              {issues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
                  <p className="text-gray-600">Your service hierarchy looks great!</p>
                </div>
              ) : (
                issues.map((issue) => (
                  <Card key={issue.id} className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{issue.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                        </div>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Affected Items:</h4>
                          <div className="space-y-2">
                            {issue.items.map((item, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{item.name}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{item.path}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Recommendation:</h4>
                          <p className="text-sm text-blue-800">{issue.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="enhancements" className="space-y-4 mt-6">
              {enhancements.map((enhancement) => (
                <Card key={enhancement.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{enhancement.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{enhancement.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getImpactColor(enhancement.impact)}>
                          {enhancement.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {enhancement.effort} effort
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Recommendation:</h4>
                        <p className="text-sm text-green-800">{enhancement.recommendation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Benefits:</h4>
                        <ul className="space-y-1">
                          {enhancement.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <ArrowRight className="h-3 w-3 text-green-600" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceQualityAnalysis;
