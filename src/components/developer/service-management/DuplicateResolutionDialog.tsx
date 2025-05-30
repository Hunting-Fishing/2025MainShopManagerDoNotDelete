import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Check, 
  X, 
  Move, 
  Merge, 
  Trash2, 
  Search, 
  Filter,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { getCategoryColor } from '@/utils/automotive/serviceTaxonomy';
import { toast } from 'sonner';

// Define interfaces for type safety
interface Service {
  id: string;
  name: string;
  category?: string;
  subcategory?: string;
  price?: number;
  estimatedTime?: number;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
}

interface DuplicateGroup {
  groupName: string;
  services: Array<{
    id: string;
    name: string;
    category?: string;
    subcategory?: string;
    price?: number;
    estimatedTime?: number;
    description?: string;
  }>;
  similarity: number;
  issues: string[];
}

interface ResolutionAction {
  groupName: string;
  action: 'merge' | 'move' | 'delete';
  targetCategoryId?: string;
  targetSubcategoryId?: string;
  selectedServices?: string[];
}

interface DuplicateResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateGroups: DuplicateGroup[];
  categories: Array<{ id: string; name: string; subcategories?: Array<{ id: string; name: string }> }>;
  onResolve: (actions: ResolutionAction[]) => Promise<void>;
}

export const DuplicateResolutionDialog: React.FC<DuplicateResolutionDialogProps> = ({
  isOpen,
  onClose,
  duplicateGroups,
  categories,
  onResolve
}) => {
  const [selectedServices, setSelectedServices] = useState<Record<string, Set<string>>>({});
  const [bulkAction, setBulkAction] = useState<'merge' | 'move' | 'delete' | ''>('');
  const [bulkTargetCategory, setBulkTargetCategory] = useState('');
  const [bulkTargetSubcategory, setBulkTargetSubcategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBySimilarity, setFilterBySimilarity] = useState(false);
  const [resolutionActions, setResolutionActions] = useState<Record<string, ResolutionAction>>({});
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const initialSelections: Record<string, Set<string>> = {};
    duplicateGroups.forEach(group => {
      initialSelections[group.groupName] = new Set();
    });
    setSelectedServices(initialSelections);
  }, [duplicateGroups]);

  const toggleServiceSelection = (groupName: string, serviceId: string) => {
    setSelectedServices(prev => {
      const newSelections = { ...prev };
      if (!newSelections[groupName]) {
        newSelections[groupName] = new Set();
      }
      
      if (newSelections[groupName].has(serviceId)) {
        newSelections[groupName].delete(serviceId);
      } else {
        newSelections[groupName].add(serviceId);
      }
      
      return newSelections;
    });
  };

  const toggleGroupSelection = (groupName: string) => {
    const group = duplicateGroups.find(g => g.groupName === groupName);
    if (!group) return;

    setSelectedServices(prev => {
      const newSelections = { ...prev };
      const currentSelections = newSelections[groupName] || new Set();
      
      if (currentSelections.size === group.services.length) {
        // Deselect all
        newSelections[groupName] = new Set();
      } else {
        // Select all
        newSelections[groupName] = new Set(group.services.map(s => s.id));
      }
      
      return newSelections;
    });
  };

  const getSelectedServicesForGroup = (groupName: string): string[] => {
    return Array.from(selectedServices[groupName] || new Set());
  };

  const isGroupFullySelected = (groupName: string): boolean => {
    const group = duplicateGroups.find(g => g.groupName === groupName);
    if (!group) return false;
    
    const selections = selectedServices[groupName] || new Set();
    return selections.size === group.services.length && group.services.length > 0;
  };

  const isGroupPartiallySelected = (groupName: string): boolean => {
    const selections = selectedServices[groupName] || new Set();
    return selections.size > 0 && !isGroupFullySelected(groupName);
  };

  const handleBulkAction = () => {
    if (!bulkAction) return;

    const newActions: Record<string, ResolutionAction> = { ...resolutionActions };

    Object.entries(selectedServices).forEach(([groupName, serviceIds]) => {
      if (serviceIds.size > 0) {
        newActions[groupName] = {
          groupName,
          action: bulkAction,
          targetCategoryId: bulkAction === 'move' ? bulkTargetCategory : undefined,
          targetSubcategoryId: bulkAction === 'move' ? bulkTargetSubcategory : undefined,
          selectedServices: Array.from(serviceIds)
        };
      }
    });

    setResolutionActions(newActions);
    toast.success(`Bulk ${bulkAction} action applied to selected services`);
  };

  const handleResolveAll = async () => {
    setIsResolving(true);
    try {
      const actions = Object.values(resolutionActions).map(action => ({
        ...action,
        selectedServices: action.selectedServices || []
      }));
      
      await onResolve(actions);
      toast.success('Duplicates resolved successfully');
      onClose();
    } catch (error) {
      console.error('Error resolving duplicates:', error);
      toast.error('Failed to resolve duplicates');
    } finally {
      setIsResolving(false);
    }
  };

  const filteredGroups = duplicateGroups.filter(group => {
    const matchesSearch = searchTerm === '' || 
      group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.services.some(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesSimilarity = !filterBySimilarity || group.similarity >= 0.8;
    
    return matchesSearch && matchesSimilarity;
  });

  const totalSelectedServices = Object.values(selectedServices).reduce(
    (total, serviceSet) => total + serviceSet.size, 
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Resolve Duplicate Services ({duplicateGroups.length} groups found)
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filter Controls */}
        <div className="space-y-4 border-b pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services or groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="similarity-filter"
                checked={filterBySimilarity}
                onCheckedChange={setFilterBySimilarity}
              />
              <Label htmlFor="similarity-filter" className="text-sm">
                High similarity only (≥80%)
              </Label>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Bulk Actions ({totalSelectedServices} services selected)</h4>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="bulk-action">Action</Label>
                <Select value={bulkAction} onValueChange={(value: 'merge' | 'move' | 'delete' | '') => setBulkAction(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bulk action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merge">
                      <div className="flex items-center gap-2">
                        <Merge className="h-4 w-4" />
                        Merge Services
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
                        Delete Services
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bulkAction === 'move' && (
                <>
                  <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="bulk-category">Target Category</Label>
                    <Select value={bulkTargetCategory} onValueChange={setBulkTargetCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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

                  {bulkTargetCategory && (
                    <div className="flex-1 min-w-[200px]">
                      <Label htmlFor="bulk-subcategory">Target Subcategory</Label>
                      <Select value={bulkTargetSubcategory} onValueChange={setBulkTargetSubcategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .find(c => c.id === bulkTargetCategory)
                            ?.subcategories?.map(sub => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <Button 
                onClick={handleBulkAction}
                disabled={!bulkAction || totalSelectedServices === 0}
                variant="outline"
              >
                Apply to Selected
              </Button>
            </div>
          </div>
        </div>

        {/* Duplicate Groups */}
        <div className="space-y-6">
          {filteredGroups.map((group) => {
            const groupSelections = selectedServices[group.groupName] || new Set();
            const isFullySelected = isGroupFullySelected(group.groupName);
            const isPartiallySelected = isGroupPartiallySelected(group.groupName);

            return (
              <div key={group.groupName} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {isFullySelected ? (
                        <CheckSquare 
                          className="h-5 w-5 text-blue-600 cursor-pointer"
                          onClick={() => toggleGroupSelection(group.groupName)}
                        />
                      ) : isPartiallySelected ? (
                        <div 
                          className="h-5 w-5 border-2 border-blue-600 bg-blue-100 cursor-pointer rounded flex items-center justify-center"
                          onClick={() => toggleGroupSelection(group.groupName)}
                        >
                          <div className="h-2 w-2 bg-blue-600 rounded-sm" />
                        </div>
                      ) : (
                        <Square 
                          className="h-5 w-5 text-gray-400 cursor-pointer"
                          onClick={() => toggleGroupSelection(group.groupName)}
                        />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{group.groupName}</h3>
                    <Badge variant="secondary">
                      {Math.round(group.similarity * 100)}% similar
                    </Badge>
                    <Badge variant="outline">
                      {groupSelections.size}/{group.services.length} selected
                    </Badge>
                  </div>
                </div>

                {group.issues.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Issues found:</strong> {group.issues.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.services.map((service) => {
                    const isSelected = groupSelections.has(service.id);
                    const colorClass = getCategoryColor(service.name);
                    
                    return (
                      <div 
                        key={service.id} 
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleServiceSelection(group.groupName, service.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <Check className="h-4 w-4 text-blue-600" />
                            ) : (
                              <div className="h-4 w-4 border border-gray-300 rounded" />
                            )}
                            <span className="font-medium">{service.name}</span>
                          </div>
                          {service.category && (
                            <Badge className={colorClass} variant="outline">
                              {service.category}
                            </Badge>
                          )}
                        </div>
                        
                        {service.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          {service.price && (
                            <span className="font-medium">${service.price}</span>
                          )}
                          {service.estimatedTime && (
                            <span>{service.estimatedTime}min</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {resolutionActions[group.groupName] && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Action scheduled: {resolutionActions[group.groupName].action} 
                        {resolutionActions[group.groupName].selectedServices?.length} services
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {Object.keys(resolutionActions).length} groups have scheduled actions
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleResolveAll}
              disabled={Object.keys(resolutionActions).length === 0 || isResolving}
            >
              {isResolving ? 'Resolving...' : `Resolve All (${Object.keys(resolutionActions).length})`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateResolutionDialog;
