import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  DuplicateItem, 
  DuplicateSearchOptions,
  DuplicateOccurrence
} from '@/utils/search/duplicateSearch';

interface DuplicateSearchResultsProps {
  duplicates: DuplicateItem[];
  recommendations: string[];
  searchOptions: DuplicateSearchOptions;
  onClose: () => void;
  onRemoveDuplicate?: (itemId: string, type: 'category' | 'subcategory' | 'job') => Promise<void>;
}

export const DuplicateSearchResults: React.FC<DuplicateSearchResultsProps> = ({
  duplicates,
  recommendations,
  searchOptions,
  onClose,
  onRemoveDuplicate
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isRemoving, setIsRemoving] = useState(false);

  const handleSelectItem = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = () => {
    const allItemIds = duplicates.flatMap(duplicate => duplicate.occurrences.map(occurrence => occurrence.itemId));
    const allSelected = allItemIds.every(itemId => selectedItems.has(itemId));
    
    if (allSelected) {
      // If all are selected, deselect all
      setSelectedItems(new Set());
    } else {
      // If not all are selected, select all
      setSelectedItems(new Set(allItemIds));
    }
  };

  const handleRemoveSelected = async () => {
    setIsRemoving(true);
    try {
      const promises = Array.from(selectedItems).map(itemId => {
        const duplicate = duplicates.find(d => d.occurrences.some(o => o.itemId === itemId));
        const occurrence = duplicate?.occurrences.find(o => o.itemId === itemId);
        
        if (occurrence) {
          return onRemoveDuplicate?.(itemId, occurrence.type);
        }
        
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      toast.success("Selected duplicates removed successfully");
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Error removing selected duplicates:", error);
      toast.error("Failed to remove selected duplicates");
    } finally {
      setIsRemoving(false);
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'bg-red-100 text-red-800';
      case 'exact_words': return 'bg-orange-100 text-orange-800';
      case 'similar': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDuplicateGroup = (duplicate: DuplicateItem, index: number) => (
    <Card key={duplicate.groupId} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={getMatchTypeColor(duplicate.matchType)}>
              {duplicate.matchType.replace('_', ' ').toUpperCase()}
            </Badge>
            <CardTitle className="text-lg">
              Duplicate Group {index + 1}: "{duplicate.name}"
            </CardTitle>
            {duplicate.similarityScore && duplicate.similarityScore < 100 && (
              <Badge variant="outline">
                {duplicate.similarityScore}% similarity
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {duplicate.occurrences.length} items
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {duplicate.occurrences.map((occurrence, occIndex) => (
            <div key={`${occurrence.itemId}-${occIndex}`} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedItems.has(occurrence.itemId)}
                  onCheckedChange={() => handleSelectItem(occurrence.itemId)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {occurrence.type}
                    </Badge>
                    <span className="font-medium">{occurrence.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {occurrence.type === 'job' && occurrence.parentCategory && occurrence.parentSubcategory && (
                      <>Category: {occurrence.parentCategory} → {occurrence.parentSubcategory}</>
                    )}
                    {occurrence.type === 'subcategory' && occurrence.parentCategory && (
                      <>Category: {occurrence.parentCategory}</>
                    )}
                    {occurrence.type === 'category' && (
                      <>Top-level category</>
                    )}
                  </div>
                  {occurrence.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {occurrence.description}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveItem(occurrence.itemId, occurrence.type)}
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const handleRemoveItem = async (itemId: string, type: 'category' | 'subcategory' | 'job') => {
    setIsRemoving(true);
    try {
      await onRemoveDuplicate?.(itemId, type);
      toast.success("Duplicate removed successfully");
    } catch (error) {
      console.error("Error removing duplicate:", error);
      toast.error("Failed to remove duplicate");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Duplicate Search Results</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
            <CardDescription>
              Found {duplicates.length} duplicate groups based on current configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[60vh]">
            {duplicates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No duplicates found with current search criteria.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {duplicates.map((duplicate, index) => renderDuplicateGroup(duplicate, index))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={duplicates.length > 0 && duplicates.flatMap(duplicate => duplicate.occurrences.map(occurrence => occurrence.itemId)).every(itemId => selectedItems.has(itemId))}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                Select All
              </Label>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="destructive" 
                onClick={handleRemoveSelected} 
                disabled={selectedItems.size === 0 || isRemoving}
              >
                {isRemoving ? "Removing..." : `Remove Selected (${selectedItems.size})`}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
