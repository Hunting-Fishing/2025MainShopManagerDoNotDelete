
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Eye,
  Trash2
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { 
  findServiceDuplicates, 
  DuplicateItem,
  DuplicateSearchOptions,
  defaultSearchOptions
} from '@/utils/search/duplicateSearch';
import { getCategoryColor } from '@/utils/automotive/serviceTaxonomy';
import { DuplicateSearchConfig } from './DuplicateSearchConfig';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchOptions, setSearchOptions] = useState<DuplicateSearchOptions>(defaultSearchOptions);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateItem | null>(null);

  // Auto-search on component mount
  useEffect(() => {
    if (categories.length > 0) {
      handleSearch();
    }
  }, [categories]);

  const handleSearch = () => {
    setSearching(true);
    
    setTimeout(() => {
      try {
        const foundDuplicates = findServiceDuplicates(categories, searchOptions);
        setDuplicates(foundDuplicates);
        
        if (foundDuplicates.length > 0) {
          toast.success(`Found ${foundDuplicates.length} duplicate groups`);
        } else {
          toast.info("No duplicates found with current criteria");
        }
      } catch (error) {
        console.error("Error searching for duplicates:", error);
        toast.error("Failed to search for duplicates");
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const filteredDuplicates = duplicates.filter(duplicate =>
    duplicate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    duplicate.occurrences.some(occ => 
      occ.parentCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occ.parentSubcategory?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleRemoveDuplicate = async (duplicateId: string, occurrenceId: string) => {
    try {
      // Remove the occurrence from the duplicate group
      setDuplicates(prevDuplicates => {
        return prevDuplicates.map(duplicate => {
          if (duplicate.groupId === duplicateId) {
            const filteredOccurrences = duplicate.occurrences.filter(
              occ => occ.itemId !== occurrenceId
            );
            
            if (filteredOccurrences.length < 2) {
              return null;
            }
            
            return {
              ...duplicate,
              occurrences: filteredOccurrences
            };
          }
          return duplicate;
        }).filter(Boolean) as DuplicateItem[];
      });
      
      toast.success("Duplicate item removed");
      onRefresh();
    } catch (error) {
      console.error("Error removing duplicate:", error);
      toast.error("Failed to remove duplicate");
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'bg-red-100 text-red-800 border-red-300';
      case 'exact_words': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'similar': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (matchType: string, count: number) => {
    if (matchType === 'exact' || count > 3) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <Eye className="h-4 w-4 text-orange-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Duplicate Services Management</h3>
            <p className="text-sm text-muted-foreground">
              Find and manage duplicate services across your hierarchy
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Configure
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearch}
              disabled={searching}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${searching ? 'animate-spin' : ''}`} />
              {searching ? 'Searching...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search duplicates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              {filteredDuplicates.length} groups
            </Badge>
            <Badge variant="outline">
              {filteredDuplicates.reduce((total, dup) => total + dup.occurrences.length, 0)} items
            </Badge>
          </div>
        </div>
      </div>

      {/* Duplicates List */}
      {filteredDuplicates.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Duplicates Found</h3>
              <p className="text-muted-foreground">
                {searching ? 'Searching for duplicates...' : 'Your service hierarchy is clean!'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDuplicates.map((duplicate) => (
            <Card key={duplicate.groupId} className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(duplicate.matchType, duplicate.occurrences.length)}
                    <CardTitle className="text-base">{duplicate.name}</CardTitle>
                    <Badge className={getMatchTypeColor(duplicate.matchType)}>
                      {duplicate.matchType.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {duplicate.occurrences.length} occurrences
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDuplicate(duplicate)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {duplicate.occurrences.map((occurrence) => (
                    <div
                      key={occurrence.itemId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getCategoryColor(occurrence.parentCategory || '')}>
                          {occurrence.parentCategory}
                        </Badge>
                        <div>
                          <div className="font-medium">{occurrence.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {occurrence.parentCategory} → {occurrence.parentSubcategory}
                          </div>
                          {occurrence.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {occurrence.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDuplicate(duplicate.groupId, occurrence.itemId)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Configuration Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Duplicate Search Configuration</DialogTitle>
          </DialogHeader>
          <DuplicateSearchConfig
            options={searchOptions}
            onOptionsChange={setSearchOptions}
          />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      {selectedDuplicate && (
        <Dialog open={!!selectedDuplicate} onOpenChange={() => setSelectedDuplicate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Duplicate Details: {selectedDuplicate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={getMatchTypeColor(selectedDuplicate.matchType)}>
                  {selectedDuplicate.matchType.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {selectedDuplicate.occurrences.length} occurrences
                </Badge>
              </div>
              <div className="space-y-3">
                {selectedDuplicate.occurrences.map((occurrence) => (
                  <div key={occurrence.itemId} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(occurrence.parentCategory || '')}>
                        {occurrence.parentCategory}
                      </Badge>
                      <span className="font-medium">{occurrence.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Path: {occurrence.parentCategory} → {occurrence.parentSubcategory}
                    </div>
                    {occurrence.description && (
                      <div className="text-sm mt-2">{occurrence.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
