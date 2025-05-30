
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SearchCheck, Settings } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { 
  findServiceDuplicates, 
  generateDuplicateRecommendations, 
  DuplicateItem,
  DuplicateSearchOptions,
  defaultSearchOptions
} from '@/utils/search/duplicateSearch';
import { DuplicateSearchResults } from './DuplicateSearchResults';
import { DuplicateSearchConfig } from './DuplicateSearchConfig';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DuplicateSearchButtonProps {
  categories: ServiceMainCategory[];
  loading?: boolean;
  onCategoriesUpdated?: () => void;
}

export const DuplicateSearchButton: React.FC<DuplicateSearchButtonProps> = ({
  categories,
  loading = false,
  onCategoriesUpdated
}) => {
  const [showResults, setShowResults] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOptions, setSearchOptions] = useState<DuplicateSearchOptions>(defaultSearchOptions);
  
  const handleSearch = () => {
    setSearching(true);
    
    // Add a small delay to show searching state
    setTimeout(() => {
      try {
        console.log('Searching for duplicates with options:', searchOptions);
        const foundDuplicates = findServiceDuplicates(categories, searchOptions);
        console.log('Found duplicates:', foundDuplicates);
        
        setDuplicates(foundDuplicates);
        setRecommendations(generateDuplicateRecommendations(foundDuplicates));
        setShowResults(true);
        
        // Show toast notification with count and match types
        if (foundDuplicates.length > 0) {
          const exactCount = foundDuplicates.filter(d => d.matchType === 'exact').length;
          const exactWordsCount = foundDuplicates.filter(d => d.matchType === 'exact_words').length;
          const similarCount = foundDuplicates.filter(d => d.matchType === 'similar').length;
          
          let description = '';
          if (exactCount > 0) description += `${exactCount} exact, `;
          if (exactWordsCount > 0) description += `${exactWordsCount} word matches, `;
          if (similarCount > 0) description += `${similarCount} similar`;
          description = description.replace(/, $/, '');
          
          toast.info(`Found ${foundDuplicates.length} duplicate groups`, {
            description: description || 'Review results for potential consolidation'
          });
        } else {
          toast.success("No duplicates found with current search criteria", {
            description: "Try adjusting the similarity threshold or enabling more match types"
          });
        }
      } catch (error) {
        console.error("Error searching for duplicates:", error);
        toast.error("Failed to search for duplicates");
      } finally {
        setSearching(false);
      }
    }, 500);
  };
  
  const closeResults = () => {
    setShowResults(false);
  };
  
  const handleRemoveDuplicate = async (itemId: string, type: 'category' | 'subcategory' | 'job') => {
    try {
      // For now, just show a toast - the actual removal would need more context
      toast.info(`Removing ${type} duplicates requires manual review`);
      
      // Remove the item from duplicates array
      setDuplicates(prevDuplicates => {
        return prevDuplicates.map(duplicate => {
          const filteredOccurrences = duplicate.occurrences.filter(
            occurrence => occurrence.itemId !== itemId
          );
          
          if (filteredOccurrences.length < 2) {
            return null;
          }
          
          return {
            ...duplicate,
            occurrences: filteredOccurrences
          };
        }).filter(Boolean) as DuplicateItem[];
      });
      
      if (onCategoriesUpdated) {
        onCategoriesUpdated();
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error removing duplicate item:", error);
      return Promise.reject(error);
    }
  };

  const handleOptionsChange = (newOptions: DuplicateSearchOptions) => {
    setSearchOptions(newOptions);
  };
  
  return (
    <>
      <div className="flex gap-2">
        <Dialog open={showConfig} onOpenChange={setShowConfig}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Duplicate Search Configuration</DialogTitle>
            </DialogHeader>
            <DuplicateSearchConfig
              options={searchOptions}
              onOptionsChange={handleOptionsChange}
            />
          </DialogContent>
        </Dialog>
        
        <Button
          variant="outline" 
          className="gap-2"
          onClick={handleSearch}
          disabled={loading || searching || categories.length === 0}
        >
          <SearchCheck className="h-4 w-4" />
          {searching ? "Searching..." : "Find Duplicates"}
        </Button>
      </div>
      
      {showResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[80vh]">
            <DuplicateSearchResults
              duplicates={duplicates}
              recommendations={recommendations}
              searchOptions={searchOptions}
              onClose={closeResults}
              onRemoveDuplicate={handleRemoveDuplicate}
            />
          </div>
        </div>
      )}
    </>
  );
};
