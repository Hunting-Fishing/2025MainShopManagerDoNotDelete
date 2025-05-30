
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CheckedState } from '@radix-ui/react-checkbox';
import { 
  Copy, 
  Move, 
  Trash2, 
  ChevronRight, 
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface DuplicateGroup {
  groupName: string;
  services: ServiceJob[];
  category: string;
  subcategory: string;
  confidence: number;
}

export interface DuplicateResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateGroups: DuplicateGroup[];
  categories: ServiceMainCategory[];
  onResolveDuplicates: (resolutions: {
    groupName: string;
    action: 'merge' | 'move' | 'delete';
    targetCategoryId?: string;
    targetSubcategoryId?: string;
    selectedServices?: string[];
  }[]) => Promise<void>;
}

const DuplicateResolutionDialog: React.FC<DuplicateResolutionDialogProps> = ({
  isOpen,
  onClose,
  duplicateGroups,
  categories,
  onResolveDuplicates
}) => {
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<Map<string, Set<string>>>(new Map());
  const [bulkAction, setBulkAction] = useState<'' | 'merge' | 'move' | 'delete'>('');
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [targetSubcategory, setTargetSubcategory] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Group selection handlers
  const handleGroupSelection = useCallback((groupName: string, checked: CheckedState) => {
    if (checked === "indeterminate") return;
    
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(groupName);
      } else {
        newSet.delete(groupName);
      }
      return newSet;
    });
  }, []);

  const handleSelectAllGroups = useCallback((checked: CheckedState) => {
    if (checked === "indeterminate") return;
    
    if (checked) {
      setSelectedGroups(new Set(duplicateGroups.map(group => group.groupName)));
    } else {
      setSelectedGroups(new Set());
    }
  }, [duplicateGroups]);

  // Service selection handlers
  const handleServiceSelection = useCallback((groupName: string, serviceId: string, checked: CheckedState) => {
    if (checked === "indeterminate") return;
    
    setSelectedServices(prev => {
      const newMap = new Map(prev);
      const groupServices = newMap.get(groupName) || new Set();
      
      if (checked) {
        groupServices.add(serviceId);
      } else {
        groupServices.delete(serviceId);
      }
      
      if (groupServices.size > 0) {
        newMap.set(groupName, groupServices);
      } else {
        newMap.delete(groupName);
      }
      
      return newMap;
    });
  }, []);

  const handleSelectAllServices = useCallback((groupName: string, checked: CheckedState) => {
    if (checked === "indeterminate") return;
    
    const group = duplicateGroups.find(g => g.groupName === groupName);
    if (!group) return;

    setSelectedServices(prev => {
      const newMap = new Map(prev);
      
      if (checked) {
        newMap.set(groupName, new Set(group.services.map(s => s.id)));
      } else {
        newMap.delete(groupName);
      }
      
      return newMap;
    });
  }, [duplicateGroups]);

  // Get available subcategories for selected category
  const availableSubcategories = targetCategory 
    ? categories.find(cat => cat.id === targetCategory)?.subcategories || []
    : [];

  // Handle bulk actions
  const handleBulkAction = useCallback(async () => {
    if (!bulkAction || selectedGroups.size === 0) {
      toast({
        title: "No Action Selected",
        description: "Please select an action and at least one group to process.",
        variant: "destructive"
      });
      return;
    }

    if (bulkAction === 'move' && (!targetCategory || !targetSubcategory)) {
      toast({
        title: "Missing Target",
        description: "Please select both target category and subcategory for move operation.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const resolutions = Array.from(selectedGroups).map(groupName => {
        const groupSelectedServices = selectedServices.get(groupName);
        
        return {
          groupName,
          action: bulkAction,
          targetCategoryId: bulkAction === 'move' ? targetCategory : undefined,
          targetSubcategoryId: bulkAction === 'move' ? targetSubcategory : undefined,
          selectedServices: groupSelectedServices ? Array.from(groupSelectedServices) : undefined
        };
      });

      await onResolveDuplicates(resolutions);

      toast({
        title: "Bulk Action Completed",
        description: `Successfully processed ${selectedGroups.size} duplicate groups.`
      });

      // Reset selections
      setSelectedGroups(new Set());
      setSelectedServices(new Map());
      setBulkAction('');
      setTargetCategory('');
      setTargetSubcategory('');
      onClose();

    } catch (error) {
      console.error('Error processing bulk action:', error);
      toast({
        title: "Error",
        description: "Failed to process bulk action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [bulkAction, selectedGroups, selectedServices, targetCategory, targetSubcategory, onResolveDuplicates, onClose]);

  // Get selection state for group
  const getGroupSelectionState = useCallback((groupName: string): CheckedState => {
    return selectedGroups.has(groupName);
  }, [selectedGroups]);

  // Get selection state for all groups
  const getAllGroupsSelectionState = useCallback((): CheckedState => {
    if (selectedGroups.size === 0) return false;
    if (selectedGroups.size === duplicateGroups.length) return true;
    return "indeterminate";
  }, [selectedGroups.size, duplicateGroups.length]);

  // Get selection state for services in a group
  const getGroupServicesSelectionState = useCallback((groupName: string): CheckedState => {
    const group = duplicateGroups.find(g => g.groupName === groupName);
    const groupSelectedServices = selectedServices.get(groupName);
    
    if (!group || !groupSelectedServices || groupSelectedServices.size === 0) return false;
    if (groupSelectedServices.size === group.services.length) return true;
    return "indeterminate";
  }, [duplicateGroups, selectedServices]);

  // Get action button text and icon
  const getActionButtonContent = () => {
    switch (bulkAction) {
      case 'merge':
        return { icon: <Copy className="h-4 w-4" />, text: 'Merge Selected' };
      case 'move':
        return { icon: <Move className="h-4 w-4" />, text: 'Move Selected' };
      case 'delete':
        return { icon: <Trash2 className="h-4 w-4" />, text: 'Delete Selected' };
      default:
        return { icon: null, text: 'Select Action' };
    }
  };

  const actionButton = getActionButtonContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Resolve Service Duplicates
            <Badge variant="secondary">{duplicateGroups.length} groups found</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Bulk Actions Panel */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Bulk Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Select All Groups */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={getAllGroupsSelectionState()}
                onCheckedChange={handleSelectAllGroups}
              />
              <span className="text-sm font-medium">
                Select All Groups ({selectedGroups.size}/{duplicateGroups.length} selected)
              </span>
            </div>

            <Separator />

            {/* Action Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={bulkAction} onValueChange={(value: 'merge' | 'move' | 'delete' | '') => setBulkAction(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bulk action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Merge Services</SelectItem>
                  <SelectItem value="move">Move to Category</SelectItem>
                  <SelectItem value="delete">Delete Duplicates</SelectItem>
                </SelectContent>
              </Select>

              {bulkAction === 'move' && (
                <>
                  <Select value={targetCategory} onValueChange={setTargetCategory}>
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

                  <Select value={targetSubcategory} onValueChange={setTargetSubcategory} disabled={!targetCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Target subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map(subcategory => (
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
                disabled={!bulkAction || selectedGroups.size === 0 || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    {actionButton.icon}
                    {actionButton.text}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Duplicate Groups List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {duplicateGroups.map((group) => (
            <Card key={group.groupName} className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={getGroupSelectionState(group.groupName)}
                      onCheckedChange={(checked) => handleGroupSelection(group.groupName, checked)}
                    />
                    <div>
                      <CardTitle className="text-base">{group.groupName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{group.category}</Badge>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                        <Badge variant="outline">{group.subcategory}</Badge>
                        <Badge variant="secondary">{group.confidence}% match</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={getGroupServicesSelectionState(group.groupName)}
                      onCheckedChange={(checked) => handleSelectAllServices(group.groupName, checked)}
                    />
                    <span className="text-sm text-gray-600">Select All Services</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {group.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedServices.get(group.groupName)?.has(service.id) || false}
                          onCheckedChange={(checked) => handleServiceSelection(group.groupName, service.id, checked)}
                        />
                        <div>
                          <span className="font-medium">{service.name}</span>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                        </div>
                      </div>
                      {service.price && (
                        <Badge variant="secondary">${service.price}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateResolutionDialog;
