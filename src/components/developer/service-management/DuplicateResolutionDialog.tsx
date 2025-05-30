
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Merge, Move, CheckCircle } from 'lucide-react';
import { DuplicateItem } from '@/utils/search/duplicateSearch';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { getRecommendedCategory, getCategoryColor } from '@/utils/automotive/serviceTaxonomy';

interface DuplicateResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicate: DuplicateItem | null;
  categories: ServiceMainCategory[];
  onResolve: (action: 'merge' | 'move' | 'keep', details: any) => void;
}

export const DuplicateResolutionDialog: React.FC<DuplicateResolutionDialogProps> = ({
  isOpen,
  onClose,
  duplicate,
  categories,
  onResolve
}) => {
  const [selectedAction, setSelectedAction] = useState<'merge' | 'move' | 'keep'>('merge');
  const [primaryOccurrence, setPrimaryOccurrence] = useState<string>('');
  const [targetCategory, setTargetCategory] = useState<string>('');
  
  if (!duplicate) return null;

  const recommendedCategory = getRecommendedCategory(duplicate.name);
  const colorClass = getCategoryColor(duplicate.name);

  const handleResolve = () => {
    const details = {
      duplicateName: duplicate.name,
      action: selectedAction,
      primaryOccurrence: selectedAction === 'merge' ? primaryOccurrence : null,
      targetCategory: selectedAction === 'move' ? targetCategory : null,
      occurrences: duplicate.occurrences
    };
    
    onResolve(selectedAction, details);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Resolve Duplicate: "{duplicate.name}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Duplicate Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Duplicate Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Badge className={colorClass}>
                  {duplicate.type}
                </Badge>
                <span className="text-sm text-gray-600">
                  Found in {duplicate.occurrences.length} locations
                </span>
                {recommendedCategory && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Recommended: {recommendedCategory}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Current Locations:</h4>
                {duplicate.occurrences.map((occurrence, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-mono">{occurrence.path}</span>
                    <Badge variant="secondary">ID: {occurrence.itemId}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resolution Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resolution Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Selection */}
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={selectedAction === 'merge' ? 'default' : 'outline'}
                  onClick={() => setSelectedAction('merge')}
                  className="h-20 flex-col gap-2"
                >
                  <Merge className="h-6 w-6" />
                  <span className="text-sm">Merge</span>
                </Button>
                <Button
                  variant={selectedAction === 'move' ? 'default' : 'outline'}
                  onClick={() => setSelectedAction('move')}
                  className="h-20 flex-col gap-2"
                >
                  <Move className="h-6 w-6" />
                  <span className="text-sm">Move</span>
                </Button>
                <Button
                  variant={selectedAction === 'keep' ? 'default' : 'outline'}
                  onClick={() => setSelectedAction('keep')}
                  className="h-20 flex-col gap-2"
                >
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-sm">Keep All</span>
                </Button>
              </div>

              {/* Action-specific options */}
              {selectedAction === 'merge' && (
                <div className="space-y-3">
                  <h4 className="font-medium">Select Primary Instance:</h4>
                  <Select value={primaryOccurrence} onValueChange={setPrimaryOccurrence}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose which instance to keep" />
                    </SelectTrigger>
                    <SelectContent>
                      {duplicate.occurrences.map((occurrence, index) => (
                        <SelectItem key={index} value={occurrence.itemId}>
                          {occurrence.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    All other instances will be merged into the selected primary instance.
                  </p>
                </div>
              )}

              {selectedAction === 'move' && (
                <div className="space-y-3">
                  <h4 className="font-medium">Move All To Category:</h4>
                  <Select value={targetCategory} onValueChange={setTargetCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose target category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {recommendedCategory && (
                    <p className="text-sm text-green-600">
                      ✓ Recommended category: {recommendedCategory}
                    </p>
                  )}
                </div>
              )}

              {selectedAction === 'keep' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    All instances will be kept in their current locations. This may lead to 
                    confusion and inconsistent pricing. Consider if this is intentional.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleResolve}
            disabled={
              (selectedAction === 'merge' && !primaryOccurrence) ||
              (selectedAction === 'move' && !targetCategory)
            }
          >
            Apply Resolution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
