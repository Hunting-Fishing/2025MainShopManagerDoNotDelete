
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  AlertTriangle, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  Percent,
  Type,
  Filter
} from 'lucide-react';
import { DuplicateItem, DuplicateSearchOptions } from '@/utils/search/duplicateSearch';

interface DuplicateSearchResultsProps {
  duplicates: DuplicateItem[];
  recommendations: string[];
  searchOptions: DuplicateSearchOptions;
  onClose: () => void;
  onRemoveDuplicate: (itemId: string, type: 'category' | 'subcategory' | 'job') => Promise<void>;
}

export const DuplicateSearchResults: React.FC<DuplicateSearchResultsProps> = ({
  duplicates,
  recommendations,
  searchOptions,
  onClose,
  onRemoveDuplicate
}) => {
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const getMatchTypeBadge = (matchType: DuplicateItem['matchType']) => {
    switch (matchType) {
      case 'exact':
        return <Badge className="bg-red-100 text-red-800">Exact Match</Badge>;
      case 'exact_words':
        return <Badge className="bg-orange-100 text-orange-800">Exact Words</Badge>;
      case 'similar':
        return <Badge className="bg-yellow-100 text-yellow-800">Similar</Badge>;
      case 'partial':
        return <Badge className="bg-blue-100 text-blue-800">Partial</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 95) return 'text-red-600';
    if (similarity >= 85) return 'text-orange-600';
    if (similarity >= 75) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'category':
        return '📁';
      case 'subcategory':
        return '📂';
      case 'job':
        return '🔧';
      default:
        return '📄';
    }
  };

  const handleRemoveItem = async (itemId: string, type: 'category' | 'subcategory' | 'job') => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    try {
      await onRemoveDuplicate(itemId, type);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Group duplicates by match type for better organization
  const groupedDuplicates = duplicates.reduce((acc, duplicate) => {
    const key = duplicate.matchType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(duplicate);
    return acc;
  }, {} as Record<string, DuplicateItem[]>);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Duplicate Search Results
            </CardTitle>
            <p className="text-gray-600 mt-1">
              Found {duplicates.length} duplicate groups with current search criteria
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Configuration Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Active Search Settings</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchOptions.exactMatch && <Badge variant="secondary">Exact Match</Badge>}
            {searchOptions.exactWords && <Badge variant="secondary">Exact Words</Badge>}
            {searchOptions.partialMatch && <Badge variant="secondary">Partial Match</Badge>}
            <Badge variant="outline">≥{searchOptions.similarityThreshold}% similar</Badge>
            {searchOptions.ignoreCase && <Badge variant="outline">Case insensitive</Badge>}
            {searchOptions.ignorePunctuation && <Badge variant="outline">No punctuation</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-6">
            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <strong>Recommendations:</strong>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Duplicates grouped by match type */}
            {Object.entries(groupedDuplicates).map(([matchType, items]) => (
              <div key={matchType} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold capitalize">{matchType.replace('_', ' ')} Matches</h3>
                  <Badge variant="outline">{items.length} groups</Badge>
                </div>

                <div className="space-y-4">
                  {items.map((duplicate, index) => (
                    <Card key={`${matchType}-${index}`} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getTypeIcon(duplicate.type)}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{duplicate.name}</h4>
                                {getMatchTypeBadge(duplicate.matchType)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {duplicate.type}
                                </Badge>
                                <div className={`flex items-center gap-1 text-sm ${getSimilarityColor(duplicate.similarity)}`}>
                                  <Percent className="h-3 w-3" />
                                  <span className="font-medium">{duplicate.similarity}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">
                            <strong>Found in {duplicate.occurrences.length} locations:</strong>
                          </div>
                          
                          <div className="space-y-2">
                            {duplicate.occurrences.map((occurrence, occIndex) => (
                              <div 
                                key={occurrence.itemId} 
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <ArrowRight className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm font-mono text-gray-700">
                                      {occurrence.path}
                                    </span>
                                  </div>
                                  {occurrence.normalizedName !== duplicate.name.toLowerCase() && (
                                    <div className="mt-1 text-xs text-gray-500">
                                      Normalized: {occurrence.normalizedName}
                                    </div>
                                  )}
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveItem(occurrence.itemId, duplicate.type)}
                                  disabled={removingItems.has(occurrence.itemId)}
                                  className="ml-2 text-red-600 hover:text-red-700"
                                >
                                  {removingItems.has(occurrence.itemId) ? (
                                    "Removing..."
                                  ) : (
                                    "Remove"
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {Object.keys(groupedDuplicates).length > 1 && (
                  <Separator className="my-6" />
                )}
              </div>
            ))}

            {duplicates.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Duplicates Found</h3>
                <p className="text-gray-600">
                  No duplicate services were found with the current search criteria.
                  Try adjusting the similarity threshold or enabling more match types to find potential duplicates.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
