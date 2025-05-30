
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { getCategoryColor } from '@/utils/automotive/serviceTaxonomy';
import { 
  Merge, 
  Move, 
  Trash2, 
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRight,
  Target
} from 'lucide-react';

interface DuplicateGroup {
  name: string;
  services: ServiceJob[];
  locations: Array<{
    categoryName: string;
    subcategoryName: string;
    categoryId: string;
    subcategoryId: string;
  }>;
}

interface DuplicateResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateGroups: DuplicateGroup[];
  categories: ServiceMainCategory[];
  onResolve: (resolutions: Array<{
    groupName: string;
    action: 'merge' | 'move' | 'delete';
    targetCategoryId?: string;
    targetSubcategoryId?: string;
    selectedServices?: string[];
  }>) => void;
}

const DuplicateResolutionDialog: React.FC<DuplicateResolutionDialogProps> = ({
  isOpen,
  onClose,
  duplicateGroups,
  categories,
  onResolve
}) => {
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<Map<string, Set<string>>>(new Map());
  const [bulkAction, setBulkAction] = useState<'' | 'merge' | 'move' | 'delete'>('');
  const [bulkTargetCategory, setBulkTargetCategory] = useState<string>('');
  const [bulkTargetSubcategory, setBulkTargetSubcategory] = useState<string>('');

  const toggleGroupSelection = (groupName: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupName)) {
      newSelected.delete(groupName);
    } else {
      newSelected.add(groupName);
    }
    setSelectedGroups(newSelected);
  };

  const toggleServiceSelection = (groupName: string, serviceId: string) => {
    const groupServices = selectedServices.get(groupName) || new Set();
    const newGroupServices = new Set(groupServices);
    
    if (newGroupServices.has(serviceId)) {
      newGroupServices.delete(serviceId);
    } else {
      newGroupServices.add(serviceId);
    }
    
    const newSelectedServices = new Map(selectedServices);
    newSelectedServices.set(groupName, newGroupServices);
    setSelectedServices(newSelectedServices);
  };

  const selectAllGroups = () => {
    if (selectedGroups.size === duplicateGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(duplicateGroups.map(g => g.name)));
    }
  };

  const selectAllServicesInGroup = (groupName: string) => {
    const group = duplicateGroups.find(g => g.name === groupName);
    if (!group) return;
    
    const currentServices = selectedServices.get(groupName) || new Set();
    const allServiceIds = new Set(group.services.map(s => s.id));
    
    const newSelectedServices = new Map(selectedServices);
    if (currentServices.size === group.services.length) {
      newSelectedServices.set(groupName, new Set());
    } else {
      newSelectedServices.set(groupName, allServiceIds);
    }
    setSelectedServices(newSelectedServices);
  };

  const getAvailableSubcategories = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.subcategories || [];
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedGroups.size === 0) {
      toast({
        title: 'Selection Required',
        description: 'Please select an action and at least one duplicate group',
        variant: 'destructive',
      });
      return;
    }

    if (bulkAction === 'move' && (!bulkTargetCategory || !bulkTargetSubcategory)) {
      toast({
        title: 'Target Required',
        description: 'Please select a target category and subcategory for the move action',
        variant: 'destructive',
      });
      return;
    }

    const resolutions = Array.from(selectedGroups).map(groupName => ({
      groupName,
      action: bulkAction,
      targetCategoryId: bulkAction === 'move' ? bulkTargetCategory : undefined,
      targetSubcategoryId: bulkAction === 'move' ? bulkTargetSubcategory : undefined,
      selectedServices: Array.from(selectedServices.get(groupName) || new Set()),
    }));

    onResolve(resolutions);
    onClose();
  };

  const handleIndividualResolve = (groupName: string, action: 'merge' | 'move' | 'delete') => {
    const selectedInGroup = selectedServices.get(groupName) || new Set();
    
    if (action === 'move' && (!bulkTargetCategory || !bulkTargetSubcategory)) {
      toast({
        title: 'Target Required',
        description: 'Please select a target category and subcategory',
        variant: 'destructive',
      });
      return;
    }

    onResolve([{
      groupName,
      action,
      targetCategoryId: action === 'move' ? bulkTargetCategory : undefined,
      targetSubcategoryId: action === 'move' ? bulkTargetSubcategory : undefined,
      selectedServices: Array.from(selectedInGroup),
    }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Resolve Service Duplicates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bulk Actions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllGroups}
                  className="flex items-center gap-2"
                >
                  {selectedGroups.size === duplicateGroups.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {selectedGroups.size === duplicateGroups.length ? 'Deselect All' : 'Select All'}
                </Button>
                
                <Badge variant="secondary">
                  {selectedGroups.size} of {duplicateGroups.length} groups selected
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={bulkAction} onValueChange={(value: string) => setBulkAction(value as '' | 'merge' | 'move' | 'delete')}>
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
                        Delete Selected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {bulkAction === 'move' && (
                  <>
                    <Select value={bulkTargetCategory} onValueChange={setBulkTargetCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Target category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select 
                      value={bulkTargetSubcategory} 
                      onValueChange={setBulkTargetSubcategory}
                      disabled={!bulkTargetCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Target subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSubcategories(bulkTargetCategory).map(subcategory => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                <Button 
                  onClick={handleBulkAction}
                  disabled={!bulkAction || selectedGroups.size === 0}
                  className="w-full"
                >
                  Apply to {selectedGroups.size} Groups
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Duplicate Groups */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {duplicateGroups.map((group, index) => (
                <Card key={group.name} className="border-l-4 border-l-amber-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedGroups.has(group.name)}
                          onCheckedChange={() => toggleGroupSelection(group.name)}
                        />
                        <div>
                          <CardTitle className="text-base">{group.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="destructive" className="text-xs">
                              {group.services.length} duplicates
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {group.locations.length} locations
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllServicesInGroup(group.name)}
                        >
                          {(selectedServices.get(group.name)?.size || 0) === group.services.length ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIndividualResolve(group.name, 'merge')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Merge className="h-4 w-4 mr-1" />
                          Merge
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIndividualResolve(group.name, 'move')}
                          className="text-green-600 hover:text-green-700"
                          disabled={!bulkTargetCategory || !bulkTargetSubcategory}
                        >
                          <Move className="h-4 w-4 mr-1" />
                          Move
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIndividualResolve(group.name, 'delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Services List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.services.map(service => (
                        <div key={service.id} className="flex items-center gap-2 p-2 border rounded">
                          <Checkbox
                            checked={selectedServices.get(group.name)?.has(service.id) || false}
                            onCheckedChange={() => toggleServiceSelection(group.name, service.id)}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{service.name}</div>
                            {service.description && (
                              <div className="text-xs text-muted-foreground">{service.description}</div>
                            )}
                            {service.price && (
                              <div className="text-xs text-green-600 font-medium">${service.price}</div>
                            )}
                          </div>
                          <Badge 
                            className={getCategoryColor(service.name)} 
                            variant="outline"
                          >
                            ID: {service.id.slice(-6)}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Locations */}
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Found in these locations:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.locations.map((location, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{location.categoryName}</span>
                              <ArrowRight className="h-3 w-3" />
                              <span>{location.subcategoryName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Summary */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {duplicateGroups.length} duplicate groups found • {selectedGroups.size} selected for bulk action
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateResolutionDialog;
