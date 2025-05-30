
import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Merge, 
  Move, 
  Check, 
  X, 
  ChevronDown, 
  ChevronRight,
  Search,
  SelectAll,
  Trash2,
  Settings
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { getCategoryColor, getRecommendedCategory } from '@/utils/automotive/serviceTaxonomy';
import { toast } from 'sonner';

interface DuplicateGroup {
  serviceName: string;
  count: number;
  locations: Array<{
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
    jobId: string;
    estimatedTime?: number;
    price?: number;
  }>;
}

interface DuplicateResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateGroups: DuplicateGroup[];
  categories: ServiceMainCategory[];
  onResolve: (resolutions: ResolutionAction[]) => void;
}

interface ResolutionAction {
  type: 'merge' | 'move' | 'delete' | 'keep';
  serviceName: string;
  sourceLocations: string[];
  targetLocation?: {
    categoryId: string;
    subcategoryId: string;
    jobData?: any;
  };
}

interface SelectedItem {
  groupIndex: number;
  locationIndex: number;
  serviceName: string;
  location: any;
}

const DuplicateResolutionDialog: React.FC<DuplicateResolutionDialogProps> = ({
  isOpen,
  onClose,
  duplicateGroups,
  categories,
  onResolve
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0]));
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState<'merge' | 'move' | 'delete' | ''>('');
  const [targetCategory, setTargetCategory] = useState('');
  const [targetSubcategory, setTargetSubcategory] = useState('');

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return duplicateGroups;
    return duplicateGroups.filter(group => 
      group.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [duplicateGroups, searchTerm]);

  // Get available subcategories for selected category
  const availableSubcategories = useMemo(() => {
    const category = categories.find(c => c.id === targetCategory);
    return category?.subcategories || [];
  }, [categories, targetCategory]);

  // Toggle group expansion
  const toggleGroup = (groupIndex: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedGroups(newExpanded);
  };

  // Handle item selection
  const toggleItemSelection = (groupIndex: number, locationIndex: number, serviceName: string, location: any) => {
    const itemKey = `${groupIndex}-${locationIndex}`;
    const existingIndex = selectedItems.findIndex(
      item => item.groupIndex === groupIndex && item.locationIndex === locationIndex
    );

    if (existingIndex >= 0) {
      setSelectedItems(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      setSelectedItems(prev => [...prev, { groupIndex, locationIndex, serviceName, location }]);
    }
  };

  // Select all items in a group
  const selectAllInGroup = (groupIndex: number) => {
    const group = filteredGroups[groupIndex];
    const groupItems = group.locations.map((location, locationIndex) => ({
      groupIndex,
      locationIndex,
      serviceName: group.serviceName,
      location
    }));

    // Check if all items in group are already selected
    const allSelected = groupItems.every(item => 
      selectedItems.some(selected => 
        selected.groupIndex === item.groupIndex && selected.locationIndex === item.locationIndex
      )
    );

    if (allSelected) {
      // Deselect all items in this group
      setSelectedItems(prev => prev.filter(item => item.groupIndex !== groupIndex));
    } else {
      // Select all items in this group
      setSelectedItems(prev => {
        const filtered = prev.filter(item => item.groupIndex !== groupIndex);
        return [...filtered, ...groupItems];
      });
    }
  };

  // Select all items across all groups
  const selectAllItems = () => {
    const allItems: SelectedItem[] = [];
    filteredGroups.forEach((group, groupIndex) => {
      group.locations.forEach((location, locationIndex) => {
        allItems.push({
          groupIndex,
          locationIndex,
          serviceName: group.serviceName,
          location
        });
      });
    });

    const allSelected = allItems.length === selectedItems.length;
    setSelectedItems(allSelected ? [] : allItems);
  };

  // Check if item is selected
  const isItemSelected = (groupIndex: number, locationIndex: number) => {
    return selectedItems.some(
      item => item.groupIndex === groupIndex && item.locationIndex === locationIndex
    );
  };

  // Execute bulk action
  const executeBulkAction = () => {
    if (!bulkAction || selectedItems.length === 0) {
      toast.error('Please select items and choose an action');
      return;
    }

    const resolutions: ResolutionAction[] = [];

    if (bulkAction === 'merge') {
      // Group selected items by service name
      const serviceGroups = selectedItems.reduce((acc, item) => {
        if (!acc[item.serviceName]) {
          acc[item.serviceName] = [];
        }
        acc[item.serviceName].push(item);
        return acc;
      }, {} as Record<string, SelectedItem[]>);

      Object.entries(serviceGroups).forEach(([serviceName, items]) => {
        if (items.length > 1) {
          resolutions.push({
            type: 'merge',
            serviceName,
            sourceLocations: items.map(item => 
              `${item.location.categoryId}-${item.location.subcategoryId}-${item.location.jobId}`
            ),
            targetLocation: {
              categoryId: items[0].location.categoryId,
              subcategoryId: items[0].location.subcategoryId,
              jobData: items[0].location
            }
          });
        }
      });
    } else if (bulkAction === 'move') {
      if (!targetCategory || !targetSubcategory) {
        toast.error('Please select target category and subcategory for move operation');
        return;
      }

      selectedItems.forEach(item => {
        resolutions.push({
          type: 'move',
          serviceName: item.serviceName,
          sourceLocations: [`${item.location.categoryId}-${item.location.subcategoryId}-${item.location.jobId}`],
          targetLocation: {
            categoryId: targetCategory,
            subcategoryId: targetSubcategory,
            jobData: item.location
          }
        });
      });
    } else if (bulkAction === 'delete') {
      selectedItems.forEach(item => {
        resolutions.push({
          type: 'delete',
          serviceName: item.serviceName,
          sourceLocations: [`${item.location.categoryId}-${item.location.subcategoryId}-${item.location.jobId}`]
        });
      });
    }

    onResolve(resolutions);
    setSelectedItems([]);
    setBulkAction('');
    setTargetCategory('');
    setTargetSubcategory('');
    toast.success(`Bulk ${bulkAction} operation completed for ${selectedItems.length} items`);
  };

  // Get smart recommendations for a service
  const getSmartRecommendation = (serviceName: string) => {
    const recommended = getRecommendedCategory(serviceName);
    if (recommended) {
      const category = categories.find(c => c.name.toLowerCase().includes(recommended.toLowerCase()));
      return category;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Resolve Service Duplicates
            <Badge variant="outline">{filteredGroups.length} Groups</Badge>
          </DialogTitle>
          <DialogDescription>
            Select multiple services to perform bulk operations. Use merge to consolidate duplicates, move to relocate services, or delete to remove unwanted entries.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Selection Controls */}
        <div className="space-y-4 border-b pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllItems}
              className="flex items-center gap-2"
            >
              <SelectAll className="h-4 w-4" />
              {selectedItems.length === filteredGroups.reduce((acc, group) => acc + group.locations.length, 0) ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          {/* Selection Summary */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length} items selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                >
                  Clear Selection
                </Button>
              </div>
              
              {/* Bulk Actions */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="bulk-action" className="text-xs text-blue-700">Bulk Action</Label>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger id="bulk-action" className="h-8">
                      <SelectValue placeholder="Choose action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merge">
                        <div className="flex items-center gap-2">
                          <Merge className="h-4 w-4" />
                          Merge Duplicates
                        </div>
                      </SelectItem>
                      <SelectItem value="move">
                        <div className="flex items-center gap-2">
                          <Move className="h-4 w-4" />
                          Move to Category
                        </div>
                      </SelectItem>
                      <SelectItem value="delete">
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete Selected
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bulkAction === 'move' && (
                  <>
                    <div className="flex-1">
                      <Label htmlFor="target-category" className="text-xs text-blue-700">Target Category</Label>
                      <Select value={targetCategory} onValueChange={setTargetCategory}>
                        <SelectTrigger id="target-category" className="h-8">
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Label htmlFor="target-subcategory" className="text-xs text-blue-700">Target Subcategory</Label>
                      <Select value={targetSubcategory} onValueChange={setTargetSubcategory}>
                        <SelectTrigger id="target-subcategory" className="h-8">
                          <SelectValue placeholder="Select subcategory..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubcategories.map(subcategory => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button
                  onClick={executeBulkAction}
                  disabled={!bulkAction || selectedItems.length === 0}
                  className="h-8"
                >
                  Apply to {selectedItems.length} items
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Duplicate Groups List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {filteredGroups.map((group, groupIndex) => {
            const isExpanded = expandedGroups.has(groupIndex);
            const groupSelectedCount = selectedItems.filter(item => item.groupIndex === groupIndex).length;
            const recommendation = getSmartRecommendation(group.serviceName);

            return (
              <div key={groupIndex} className="border rounded-lg">
                {/* Group Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleGroup(groupIndex)}
                      className="flex items-center gap-2 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <Badge className={getCategoryColor(group.serviceName)}>
                        {group.serviceName}
                      </Badge>
                    </button>
                    <span className="text-sm text-gray-600">
                      {group.count} duplicates in {group.locations.length} locations
                    </span>
                    {groupSelectedCount > 0 && (
                      <Badge variant="secondary">
                        {groupSelectedCount} selected
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {recommendation && (
                      <Badge variant="outline" className="text-xs">
                        Recommended: {recommendation.name}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllInGroup(groupIndex)}
                    >
                      {groupSelectedCount === group.locations.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>

                {/* Group Content */}
                {isExpanded && (
                  <div className="p-4 pt-0">
                    <div className="grid gap-2">
                      {group.locations.map((location, locationIndex) => (
                        <div
                          key={locationIndex}
                          className={`flex items-center gap-3 p-3 border rounded-md transition-colors ${
                            isItemSelected(groupIndex, locationIndex)
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            checked={isItemSelected(groupIndex, locationIndex)}
                            onCheckedChange={() => 
                              toggleItemSelection(groupIndex, locationIndex, group.serviceName, location)
                            }
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{location.categoryName}</span>
                              <span className="text-gray-500">→</span>
                              <span className="text-gray-700">{location.subcategoryName}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {location.estimatedTime && (
                                <span className="mr-4">⏱ {location.estimatedTime} min</span>
                              )}
                              {location.price && (
                                <span>${location.price}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedItems.length > 0 
              ? `${selectedItems.length} items selected across ${new Set(selectedItems.map(item => item.groupIndex)).size} groups`
              : `${filteredGroups.length} duplicate groups found`
            }
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedItems.length > 0) {
                  executeBulkAction();
                }
                onClose();
              }}
              disabled={selectedItems.length === 0}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateResolutionDialog;
