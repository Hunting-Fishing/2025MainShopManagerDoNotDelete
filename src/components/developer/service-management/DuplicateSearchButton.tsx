
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SearchCheck } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { findServiceDuplicates, generateDuplicateRecommendations, DuplicateItem } from '@/utils/search/duplicateSearch';
import { DuplicateSearchResults } from './DuplicateSearchResults';
import { toast } from 'sonner';

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
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  
  const handleSearch = () => {
    setSearching(true);
    
    // Simulate a brief delay to show the searching state
    setTimeout(() => {
      try {
        const foundDuplicates = findServiceDuplicates(categories);
        setDuplicates(foundDuplicates);
        setRecommendations(generateDuplicateRecommendations(foundDuplicates));
        setShowResults(true);
        
        // Show toast notification with count
        if (foundDuplicates.length > 0) {
          toast.info(`Found ${foundDuplicates.length} duplicate items in your service hierarchy`, {
            description: "Review the results to improve organization"
          });
        } else {
          toast.success("No duplicates found in your service hierarchy");
        }
      } catch (error) {
        console.error("Error searching for duplicates:", error);
        toast.error("Failed to search for duplicates");
      } finally {
        setSearching(false);
      }
    }, 800);
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
          // Filter out the removed occurrence
          const filteredOccurrences = duplicate.occurrences.filter(
            occurrence => occurrence.itemId !== itemId
          );
          
          // If no occurrences left, remove the duplicate item
          if (filteredOccurrences.length < 2) {
            return null;
          }
          
          // Return updated duplicate with filtered occurrences
          return {
            ...duplicate,
            occurrences: filteredOccurrences
          };
        }).filter(Boolean) as DuplicateItem[];
      });
      
      // Trigger callback to refresh the categories if provided
      if (onCategoriesUpdated) {
        onCategoriesUpdated();
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error removing duplicate item:", error);
      return Promise.reject(error);
    }
  };
  
  return (
    <>
      <Button
        variant="outline" 
        className="gap-2"
        onClick={handleSearch}
        disabled={loading || searching || categories.length === 0}
      >
        <SearchCheck className="h-4 w-4" />
        {searching ? "Searching..." : "Find Duplicates"}
      </Button>
      
      {showResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[80vh]">
            <DuplicateSearchResults
              duplicates={duplicates}
              recommendations={recommendations}
              onClose={closeResults}
              onRemoveDuplicate={handleRemoveDuplicate}
            />
          </div>
        </div>
      )}
    </>
  );
};
