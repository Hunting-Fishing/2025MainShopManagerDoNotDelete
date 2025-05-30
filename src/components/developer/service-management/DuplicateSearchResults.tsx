
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { DuplicateItem, DuplicateSearchOptions } from '@/utils/search/duplicateSearch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface DuplicateSearchResultsProps {
  duplicates: DuplicateItem[];
  recommendations: string[];
  searchOptions: DuplicateSearchOptions;
  onClose: () => void;
  onRemoveDuplicate: (itemId: string, type: 'category' | 'subcategory' | 'job') => Promise<void>;
}

interface ResultFilters {
  searchTerm: string;
  matchType: string;
  minSimilarity: number;
  category: string;
  showResolved: boolean;
  sortBy: 'similarity' | 'occurrences' | 'category';
  sortOrder: 'asc' | 'desc';
}

export const DuplicateSearchResults: React.FC<DuplicateSearchResultsProps> = ({
  duplicates,
  recommendations,
  searchOptions,
  onClose,
  onRemoveDuplicate
}) => {
  const [filters, setFilters] = useState<ResultFilters>({
    searchTerm: '',
    matchType: 'all',
    minSimilarity: 50,
    category: 'all',
    showResolved: true,
    sortBy: 'similarity',
    sortOrder: 'desc'
  });

  const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort duplicates
  const filteredDuplicates = useMemo(() => {
    let filtered = duplicates.filter(duplicate => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = duplicate.text.toLowerCase().includes(searchLower) ||
          duplicate.occurrences.some(occ => 
            occ.categoryName?.toLowerCase().includes(searchLower) ||
            occ.subcategoryName?.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Match type filter
      if (filters.matchType !== 'all' && duplicate.matchType !== filters.matchType) {
        return false;
      }

      // Similarity filter
      if (duplicate.similarity < filters.minSimilarity) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all') {
        const hasCategory = duplicate.occurrences.some(occ => 
          occ.categoryName === filters.category
        );
        if (!hasCategory) return false;
      }

      // Resolved filter
      if (!filters.showResolved && resolvedItems.has(duplicate.id)) {
        return false;
      }

      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'similarity':
          comparison = a.similarity - b.similarity;
          break;
        case 'occurrences':
          comparison = a.occurrences.length - b.occurrences.length;
          break;
        case 'category':
          const aCat = a.occurrences[0]?.categoryName || '';
          const bCat = b.occurrences[0]?.categoryName || '';
          comparison = aCat.localeCompare(bCat);
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [duplicates, filters, resolvedItems]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    duplicates.forEach(duplicate => {
      duplicate.occurrences.forEach(occ => {
        if (occ.categoryName) categories.add(occ.categoryName);
      });
    });
    return Array.from(categories).sort();
  }, [duplicates]);

  const handleResolveGroup = (groupId: string) => {
    setResolvedItems(prev => new Set([...prev, groupId]));
    toast.success("Duplicate group marked as resolved");
  };

  const handleToggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'bg-red-100 text-red-800 border-red-300';
      case 'exact_words': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'similar': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'partial': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-red-600';
    if (similarity >= 80) return 'text-orange-600';
    if (similarity >= 70) return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Duplicate Search Results</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Found {filteredDuplicates.length} duplicate groups from {duplicates.length} total
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Configuration Summary */}
        <div className="bg-gray-50 p-3 rounded-lg mt-4">
          <h4 className="font-medium text-sm mb-2">Search Configuration</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Scope: {searchOptions.searchScope}
            </Badge>
            <Badge variant="outline">
              Threshold: {searchOptions.similarityThreshold}%
            </Badge>
            <Badge variant="outline">
              Min Group: {searchOptions.minGroupSize}
            </Badge>
            {Object.entries(searchOptions.matchTypes)
              .filter(([_, enabled]) => enabled)
              .map(([type]) => (
                <Badge key={type} className={getMatchTypeColor(type)}>
                  {type.replace('_', ' ')}
                </Badge>
              ))}
          </div>
        </div>

        {/* Filters */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mt-3">
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Search</Label>
                <Input
                  placeholder="Search duplicates..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Match Type</Label>
                <Select 
                  value={filters.matchType} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, matchType: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="exact">Exact Match</SelectItem>
                    <SelectItem value="exact_words">Exact Words</SelectItem>
                    <SelectItem value="similar">Similar</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Sort By</Label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value: 'similarity' | 'occurrences' | 'category') => 
                    setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="similarity">Similarity</SelectItem>
                    <SelectItem value="occurrences">Occurrences</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Sort Order</Label>
                <Select 
                  value={filters.sortOrder} 
                  onValueChange={(value: 'asc' | 'desc') => 
                    setFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-resolved"
                  checked={filters.showResolved}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showResolved: checked }))}
                />
                <Label htmlFor="show-resolved" className="text-sm">Show Resolved</Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {filteredDuplicates.length === 0 ? (
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No duplicates found</h3>
            <p className="text-gray-600">
              {duplicates.length === 0 
                ? "No duplicates detected with current search criteria."
                : "All duplicates are filtered out. Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDuplicates.map((duplicate) => {
              const isResolved = resolvedItems.has(duplicate.id);
              const isExpanded = expandedGroups.has(duplicate.id);

              return (
                <Card key={duplicate.id} className={`${isResolved ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleGroup(duplicate.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getMatchTypeColor(duplicate.matchType)}>
                              {duplicate.matchType.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getSimilarityColor(duplicate.similarity)}>
                              {duplicate.similarity}% similar
                            </Badge>
                            <Badge variant="secondary">
                              {duplicate.occurrences.length} occurrences
                            </Badge>
                            {isResolved && (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900">"{duplicate.text}"</h4>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isResolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveGroup(duplicate.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {duplicate.occurrences.map((occurrence, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {occurrence.categoryName} → {occurrence.subcategoryName}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Type: {occurrence.type} | ID: {occurrence.itemId}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRemoveDuplicate(occurrence.itemId, occurrence.type)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
