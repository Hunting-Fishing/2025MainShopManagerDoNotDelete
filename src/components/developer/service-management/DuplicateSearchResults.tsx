
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2,
  Search,
  FileText
} from 'lucide-react';
import { DuplicateItem, DuplicateOccurrence, DuplicateSearchOptions } from '@/utils/search/duplicateSearch';
import { toast } from 'sonner';

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

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'bg-red-100 text-red-800';
      case 'exact_words': return 'bg-orange-100 text-orange-800';
      case 'similar': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'category': return '📁';
      case 'subcategory': return '📂';
      case 'job': return '🔧';
      default: return '📄';
    }
  };

  const handleRemoveItem = async (occurrence: DuplicateOccurrence) => {
    if (removingItems.has(occurrence.itemId)) return;

    setRemovingItems(prev => new Set(prev).add(occurrence.itemId));
    
    try {
      await onRemoveDuplicate(occurrence.itemId, occurrence.itemType);
      toast.success(`${occurrence.itemType} removed successfully`);
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(`Failed to remove ${occurrence.itemType}`);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(occurrence.itemId);
        return newSet;
      });
    }
  };

  const totalDuplicates = duplicates.reduce((acc, dup) => acc + dup.occurrences.length, 0);

  return (
    <Card className="w-full bg-white shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Duplicate Search Results
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Found {duplicates.length} duplicate groups affecting {totalDuplicates} items
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Configuration Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Search Configuration</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>Scope: {searchOptions.searchScope}</div>
            <div>Similarity: {searchOptions.similarityThreshold}%</div>
            <div>Match Types: {searchOptions.matchTypes.join(', ')}</div>
            <div>Min Word Length: {searchOptions.minWordLength}</div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recommendations
            </h4>
            <div className="space-y-1">
              {recommendations.map((rec, index) => (
                <div key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Duplicate Groups */}
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {duplicates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <h3 className="font-medium">No Duplicates Found</h3>
                <p className="text-sm">Your service hierarchy looks clean!</p>
              </div>
            ) : (
              duplicates.map((duplicate, index) => (
                <Card key={duplicate.groupId} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getMatchTypeColor(duplicate.matchType)}>
                          {duplicate.matchType.replace('_', ' ')}
                        </Badge>
                        {duplicate.matchType === 'similar' && (
                          <span className="text-xs text-gray-500">
                            {duplicate.similarity.toFixed(1)}% similar
                          </span>
                        )}
                      </div>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {duplicate.occurrences.map((occurrence, occIndex) => (
                      <div key={occurrence.itemId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getTypeIcon(occurrence.itemType)}</span>
                            <span className="font-medium">{occurrence.itemName}</span>
                            <Badge variant="outline" className="text-xs">
                              {occurrence.itemType}
                            </Badge>
                          </div>
                          {(occurrence.parentCategory || occurrence.parentSubcategory) && (
                            <div className="text-xs text-gray-500">
                              {occurrence.parentCategory && `${occurrence.parentCategory}`}
                              {occurrence.parentSubcategory && ` > ${occurrence.parentSubcategory}`}
                            </div>
                          )}
                          {occurrence.description && (
                            <div className="text-xs text-gray-600 mt-1">
                              {occurrence.description}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(occurrence)}
                          disabled={removingItems.has(occurrence.itemId)}
                          className="ml-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
