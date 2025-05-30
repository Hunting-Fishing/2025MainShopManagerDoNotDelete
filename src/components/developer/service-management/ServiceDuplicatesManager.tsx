
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchCheck, Settings, Trash2, RefreshCw } from 'lucide-react';
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

interface ServiceDuplicatesManagerProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

export const ServiceDuplicatesManager: React.FC<ServiceDuplicatesManagerProps> = ({
  categories,
  onRefresh
}) => {
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [searchOptions, setSearchOptions] = useState<DuplicateSearchOptions>(defaultSearchOptions);

  const handleSearch = () => {
    setSearching(true);
    
    setTimeout(() => {
      try {
        console.log('Searching for duplicates with options:', searchOptions);
        const foundDuplicates = findServiceDuplicates(categories, searchOptions);
        console.log('Found duplicates:', foundDuplicates);
        
        setDuplicates(foundDuplicates);
        setRecommendations(generateDuplicateRecommendations(foundDuplicates));
        setShowResults(true);
        
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

  const handleRemoveDuplicate = async (itemId: string, type: 'category' | 'subcategory' | 'job') => {
    try {
      toast.info(`Removing ${type} duplicates requires manual review`);
      
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
      
      onRefresh();
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error removing duplicate item:", error);
      return Promise.reject(error);
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return 'bg-red-100 text-red-800';
      case 'exact_words':
        return 'bg-orange-100 text-orange-800';
      case 'similar':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchCheck className="h-5 w-5" />
            Duplicate Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Dialog open={showConfig} onOpenChange={setShowConfig}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Configure Search
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Duplicate Search Configuration</DialogTitle>
                </DialogHeader>
                <DuplicateSearchConfig
                  options={searchOptions}
                  onOptionsChange={setSearchOptions}
                />
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleSearch}
              disabled={searching || categories.length === 0}
              className="gap-2"
            >
              <SearchCheck className="h-4 w-4" />
              {searching ? "Searching..." : "Find Duplicates"}
            </Button>

            <Button
              variant="outline"
              onClick={onRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-blue-600">Categories</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
              </div>
              <div className="text-sm text-green-600">Subcategories</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {categories.reduce((sum, cat) => 
                  sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
                )}
              </div>
              <div className="text-sm text-purple-600">Jobs</div>
            </div>
          </div>

          {/* Recent Duplicates Summary */}
          {duplicates.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Recent Search Results</h3>
              <div className="grid gap-2">
                {duplicates.slice(0, 3).map((duplicate, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Badge className={getMatchTypeColor(duplicate.matchType)}>
                        {duplicate.matchType.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm">
                        {duplicate.occurrences.length} items, {duplicate.similarity}% similarity
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResults(true)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
                {duplicates.length > 3 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResults(true)}
                    >
                      View All {duplicates.length} Results
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[80vh]">
            <DuplicateSearchResults
              duplicates={duplicates}
              recommendations={recommendations}
              searchOptions={searchOptions}
              onClose={() => setShowResults(false)}
              onRemoveDuplicate={handleRemoveDuplicate}
            />
          </div>
        </div>
      )}
    </div>
  );
};
