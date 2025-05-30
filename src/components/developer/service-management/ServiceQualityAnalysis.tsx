import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import DuplicateResolutionDialog from './DuplicateResolutionDialog';
import ServiceQualityMetrics from './ServiceQualityMetrics';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { getCategoryColor, getRecommendedCategory, AUTOMOTIVE_SERVICE_TAXONOMY } from '@/utils/automotive/serviceTaxonomy';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  BarChart3,
  Target,
  Lightbulb,
  Settings
} from 'lucide-react';

interface DuplicateGroup {
  name: string;
  services: ServiceJob[];
  locations: Array<{
    categoryName: string;
    subcategoryName: string;
    categoryId: string;
    subcategoryId: string;
  }>;
}

interface MisplacedService {
  service: ServiceJob;
  currentLocation: { categoryName: string; subcategoryName: string };
  recommendedCategory: string;
}

interface MissingColorService {
  service: ServiceJob;
}

interface AnalysisResults {
  duplicates: DuplicateGroup[];
  misplacedServices: MisplacedService[];
  missingColorServices: MissingColorService[];
  qualityScore: number;
}

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'duplicates' | 'misplaced' | 'missing-color'>('all');
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());

  const analysisResults = useMemo(() => {
    const duplicateGroups = new Map<string, {
      name: string;
      services: ServiceJob[];
      locations: Array<{
        categoryName: string;
        subcategoryName: string;
        categoryId: string;
        subcategoryId: string;
      }>;
    }>();

    const misplacedServices: Array<{
      service: ServiceJob;
      currentLocation: { categoryName: string; subcategoryName: string };
      recommendedCategory: string;
    }> = [];

    const missingColorServices: ServiceJob[] = [];
    const qualityScore = { total: 0, issues: 0 };

    // Analyze each category
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(service => {
          qualityScore.total++;

          // Check for duplicates
          const normalizedName = service.name.toLowerCase().trim();
          if (!duplicateGroups.has(normalizedName)) {
            duplicateGroups.set(normalizedName, {
              name: service.name,
              services: [],
              locations: []
            });
          }

          const group = duplicateGroups.get(normalizedName)!;
          group.services.push(service);
          
          // Add location if not already present
          const locationExists = group.locations.some(loc => 
            loc.categoryId === category.id && loc.subcategoryId === subcategory.id
          );
          
          if (!locationExists) {
            group.locations.push({
              categoryName: category.name,
              subcategoryName: subcategory.name,
              categoryId: category.id,
              subcategoryId: subcategory.id
            });
          }

          // Check for color assignment
          const color = getCategoryColor(service.name);
          if (color.includes('gray')) {
            missingColorServices.push(service);
            qualityScore.issues++;
          }

          // Check for misplaced services
          const recommendedCategory = getRecommendedCategory(service.name);
          if (recommendedCategory && recommendedCategory !== category.name) {
            misplacedServices.push({
              service,
              currentLocation: {
                categoryName: category.name,
                subcategoryName: subcategory.name
              },
              recommendedCategory
            });
            qualityScore.issues++;
          }
        });
      });
    });

    // Filter out non-duplicates
    const actualDuplicates = Array.from(duplicateGroups.values())
      .filter(group => group.services.length > 1 || group.locations.length > 1);

    actualDuplicates.forEach(() => qualityScore.issues++);

    return {
      duplicates: actualDuplicates,
      misplacedServices,
      missingColorServices,
      qualityScore: Math.max(0, Math.round(((qualityScore.total - qualityScore.issues) / qualityScore.total) * 100))
    };
  }, [categories]);

  const filteredResults = useMemo(() => {
    let items: any[] = [];

    switch (filterType) {
      case 'duplicates':
        items = analysisResults.duplicates;
        break;
      case 'misplaced':
        items = analysisResults.misplacedServices;
        break;
      case 'missing-color':
        items = analysisResults.missingColorServices.map(service => ({ service }));
        break;
      default:
        items = [
          ...analysisResults.duplicates.map(d => ({ type: 'duplicate', ...d })),
          ...analysisResults.misplacedServices.map(m => ({ type: 'misplaced', ...m })),
          ...analysisResults.missingColorServices.map(s => ({ type: 'missing-color', service: s }))
        ];
    }

    if (searchTerm) {
      items = items.filter(item => {
        const searchText = searchTerm.toLowerCase();
        if (item.name) return item.name.toLowerCase().includes(searchText);
        if (item.service) return item.service.name.toLowerCase().includes(searchText);
        return false;
      });
    }

    return items;
  }, [analysisResults, filterType, searchTerm]);

  const handleResolveSelected = () => {
    if (selectedIssues.size === 0) {
      toast({
        title: 'No Issues Selected',
        description: 'Please select at least one issue to resolve',
        variant: 'destructive',
      });
      return;
    }

    const selectedDuplicates = analysisResults.duplicates.filter(dup => 
      selectedIssues.has(dup.name)
    );

    if (selectedDuplicates.length > 0) {
      setShowResolutionDialog(true);
    }
  };

  const handleResolutionComplete = (resolutions: any[]) => {
    console.log('Resolutions applied:', resolutions);
    toast({
      title: 'Resolutions Applied',
      description: `Successfully processed ${resolutions.length} duplicate groups`,
      variant: 'default',
    });
    onRefresh();
    setSelectedIssues(new Set());
  };

  const toggleIssueSelection = (issueId: string) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueId)) {
      newSelected.delete(issueId);
    } else {
      newSelected.add(issueId);
    }
    setSelectedIssues(newSelected);
  };

  const selectAllIssues = () => {
    if (selectedIssues.size === filteredResults.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(filteredResults.map((item, index) => 
        item.name || item.service?.name || `item-${index}`
      )));
    }
  };

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <ServiceQualityMetrics 
        qualityScore={analysisResults.qualityScore}
        duplicatesCount={analysisResults.duplicates.length}
        misplacedCount={analysisResults.misplacedServices.length}
        missingColorCount={analysisResults.missingColorServices.length}
      />

      {/* Main Analysis */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Service Quality Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Identify and resolve service hierarchy issues
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllIssues}
                disabled={filteredResults.length === 0}
              >
                {selectedIssues.size === filteredResults.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              <Button
                onClick={handleResolveSelected}
                disabled={selectedIssues.size === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Resolve Selected ({selectedIssues.size})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="duplicates">Duplicates Only</SelectItem>
                <SelectItem value="misplaced">Misplaced Services</SelectItem>
                <SelectItem value="missing-color">Missing Colors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Issues Found</h3>
                  <p className="text-muted-foreground">
                    {filterType === 'all' 
                      ? 'Your service hierarchy looks great!' 
                      : `No ${filterType.replace('-', ' ')} issues detected.`
                    }
                  </p>
                </div>
              ) : (
                filteredResults.map((item, index) => {
                  const itemId = item.name || item.service?.name || `item-${index}`;
                  const isSelected = selectedIssues.has(itemId);

                  return (
                    <Card 
                      key={itemId}
                      className={`border-l-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-blue-500' : 'border-l-amber-400'
                      }`}
                      onClick={() => toggleIssueSelection(itemId)}
                    >
                      <CardContent className="p-4">
                        {/* Duplicate Group */}
                        {item.services && (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="destructive" className="text-xs">
                                    Duplicate
                                  </Badge>
                                  <h4 className="font-semibold">{item.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.services.length} identical services found in {item.locations.length} location(s)
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {item.locations.map((location: any, idx: number) => (
                                <div key={idx} className="text-sm p-2 bg-muted rounded flex items-center gap-2">
                                  <Target className="h-3 w-3" />
                                  <span>{location.categoryName}</span>
                                  <ArrowRight className="h-3 w-3" />
                                  <span>{location.subcategoryName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Misplaced Service */}
                        {item.service && item.currentLocation && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                                {item.type === 'misplaced' ? 'Misplaced' : 'Missing Color'}
                              </Badge>
                              <h4 className="font-semibold">{item.service.name}</h4>
                            </div>
                            
                            {item.currentLocation && (
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Current:</span>
                                  <Badge variant="outline">
                                    {item.currentLocation.categoryName} → {item.currentLocation.subcategoryName}
                                  </Badge>
                                </div>
                                
                                {item.recommendedCategory && (
                                  <div className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-amber-500" />
                                    <span className="text-muted-foreground">Suggested:</span>
                                    <Badge variant="outline" className="border-green-300 text-green-700">
                                      {item.recommendedCategory}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Missing Color Service */}
                        {item.service && !item.currentLocation && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                Missing Color
                              </Badge>
                              <h4 className="font-semibold">{item.service.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Service needs professional categorization for proper color coding
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Resolution Dialog */}
      <DuplicateResolutionDialog
        isOpen={showResolutionDialog}
        onClose={() => setShowResolutionDialog(false)}
        duplicateGroups={analysisResults.duplicates.filter(dup => selectedIssues.has(dup.name))}
        categories={categories}
        onResolve={handleResolutionComplete}
      />
    </div>
  );
};

export default ServiceQualityAnalysis;
