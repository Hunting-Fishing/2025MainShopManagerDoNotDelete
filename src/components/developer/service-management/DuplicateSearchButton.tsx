
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { findDuplicateItems, DuplicateItem } from '@/utils/search/duplicateSearch';
import { DuplicateSearchResults } from './DuplicateSearchResults';
import { removeDuplicateItem } from '@/lib/services/serviceApi';

interface DuplicateSearchButtonProps {
  categories: ServiceMainCategory[];
  loading: boolean;
  onCategoriesUpdated: () => void;
}

export const DuplicateSearchButton: React.FC<DuplicateSearchButtonProps> = ({
  categories,
  loading,
  onCategoriesUpdated
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      // Find duplicates in the service hierarchy
      const results = findDuplicateItems(categories);
      setDuplicates(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error finding duplicates:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleRemoveDuplicate = async (itemId: string, type: 'category' | 'subcategory' | 'job') => {
    await removeDuplicateItem(itemId, type);
    
    // After removing, refresh the categories list and re-run the search
    onCategoriesUpdated();
    
    // Re-run the search to update the duplicates list
    const updatedCategories = await fetch('/api/services').then(res => res.json());
    const updatedResults = findDuplicateItems(updatedCategories);
    setDuplicates(updatedResults);
    
    return Promise.resolve();
  };
  
  const getRecommendations = (): string[] => {
    const recommendations = [
      "Look for items with identical names but different capitalization or spacing.",
      "Consider standardizing naming conventions across your service hierarchy.",
      "Use more specific names for services to avoid confusion.",
      "Combine similar services with just slight variations into a single service.",
      "Check for typos or misspellings that may have created duplicates."
    ];
    
    return recommendations;
  };
  
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleSearch}
        disabled={loading || isSearching || categories.length === 0}
      >
        <Search className="h-4 w-4 mr-1" />
        {isSearching ? "Searching..." : "Find Duplicates"}
      </Button>
      
      {showResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-5xl w-full">
            <DuplicateSearchResults 
              duplicates={duplicates}
              recommendations={getRecommendations()}
              onClose={() => setShowResults(false)}
              onRemoveDuplicate={handleRemoveDuplicate}
            />
          </div>
        </div>
      )}
    </>
  );
};
