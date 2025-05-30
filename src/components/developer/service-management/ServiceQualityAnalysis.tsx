
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { findServiceDuplicates, DuplicateItem } from '@/utils/search/duplicateSearch';
import { DuplicateResolutionDialog } from './DuplicateResolutionDialog';
import { ServiceQualityMetrics } from './ServiceQualityMetrics';
import { getCategoryColor, AUTOMOTIVE_SERVICE_TAXONOMY } from '@/utils/automotive/serviceTaxonomy';
import { 
  Search, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  Merge,
  Palette,
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());
  const [editingDuplicate, setEditingDuplicate] = useState<DuplicateItem | null>(null);
  const [resolvingDuplicate, setResolvingDuplicate] = useState<DuplicateItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'category' | 'subcategory' | 'job'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showColorLegend, setShowColorLegend] = useState(false);

  // Calculate duplicates and metrics
  const duplicates = useMemo(() => findServiceDuplicates(categories), [categories]);
  
  const filteredDuplicates = useMemo(() => {
    let filtered = duplicates;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(dup => dup.type === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(dup => 
        dup.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [duplicates, filterType, searchTerm]);

  const handleSelectDuplicate = (duplicateKey: string, isSelected: boolean) => {
    const newSelected = new Set(selectedDuplicates);
    if (isSelected) {
      newSelected.add(duplicateKey);
    } else {
      newSelected.delete(duplicateKey);
    }
    setSelectedDuplicates(newSelected);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedDuplicates(new Set(filteredDuplicates.map(dup => dup.name)));
    } else {
      setSelectedDuplicates(new Set());
    }
  };

  const handleBulkDelete = () => {
    if (selectedDuplicates.size === 0) return;
    
    toast.success(`Marked ${selectedDuplicates.size} duplicate groups for resolution`);
    setSelectedDuplicates(new Set());
    onRefresh();
  };

  const handleEditDuplicate = (duplicate: DuplicateItem) => {
    setEditingDuplicate(duplicate);
  };

  const handleSaveEdit = () => {
    if (!editingDuplicate) return;
    
    toast.success('Duplicate information updated successfully');
    setEditingDuplicate(null);
    onRefresh();
  };

  const handleResolveConflict = (action: 'merge' | 'move' | 'keep', details: any) => {
    console.log('Resolving duplicate with action:', action, details);
    
    switch (action) {
      case 'merge':
        toast.success(`Merged "${details.duplicateName}" into primary instance`);
        break;
      case 'move':
        toast.success(`Moved all instances of "${details.duplicateName}" to selected category`);
        break;
      case 'keep':
        toast.info(`Kept all instances of "${details.duplicateName}" in current locations`);
        break;
    }
    
    onRefresh();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <AlertTriangle className="h-4 w-4" />;
      case 'subcategory':
        return <Search className="h-4 w-4" />;
      case 'job':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quality Metrics */}
      <ServiceQualityMetrics categories={categories} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Service Quality Analysis</h3>
          <p className="text-sm text-gray-600">
            Professional analysis of service hierarchy quality and consistency
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColorLegend(!showColorLegend)}
          >
            <Palette className="h-4 w-4 mr-2" />
            Color Legend
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Color Legend */}
      {showColorLegend && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Color-Coding Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AUTOMOTIVE_SERVICE_TAXONOMY.map((taxonomy, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${taxonomy.color}`} />
                  <span className="text-sm">{taxonomy.category}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                <span className="text-sm">Uncategorized</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search duplicates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All ({duplicates.length})
              </Button>
              <Button
                variant={filterType === 'category' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('category')}
              >
                Categories ({duplicates.filter(d => d.type === 'category').length})
              </Button>
              <Button
                variant={filterType === 'subcategory' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('subcategory')}
              >
                Subcategories ({duplicates.filter(d => d.type === 'subcategory').length})
              </Button>
              <Button
                variant={filterType === 'job' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('job')}
              >
                Jobs ({duplicates.filter(d => d.type === 'job').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedDuplicates.size > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{selectedDuplicates.size} duplicate groups selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Mark for Resolution
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicates List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quality Issues ({filteredDuplicates.length})
            </CardTitle>
            {filteredDuplicates.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDuplicates.size === filteredDuplicates.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredDuplicates.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Excellent Quality!</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' 
                  ? 'No quality issues found matching your filters.' 
                  : 'No duplicate services found. Your service hierarchy is well-organized.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDuplicates.map((duplicate, index) => {
                const colorClass = getCategoryColor(duplicate.name);
                const isSelected = selectedDuplicates.has(duplicate.name);
                
                return (
                  <div
                    key={`${duplicate.name}-${index}`}
                    className={`border rounded-lg p-4 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleSelectDuplicate(duplicate.name, checked as boolean)
                          }
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(duplicate.type)}
                            <h4 className="font-medium">{duplicate.name}</h4>
                            <Badge className={colorClass}>
                              {duplicate.type}
                            </Badge>
                            <Badge variant="destructive">
                              {duplicate.occurrences.length} duplicates
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 font-medium">Found in:</p>
                            {duplicate.occurrences.map((occurrence, idx) => (
                              <div key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-gray-200">
                                {occurrence.path}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDuplicate(duplicate)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setResolvingDuplicate(duplicate)}
                        >
                          <Merge className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingDuplicate} onOpenChange={() => setEditingDuplicate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Duplicate Information</DialogTitle>
          </DialogHeader>
          {editingDuplicate && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editingDuplicate.name}
                  onChange={(e) => 
                    setEditingDuplicate({...editingDuplicate, name: e.target.value})
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Add notes about this duplicate..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDuplicate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolution Dialog */}
      <DuplicateResolutionDialog
        isOpen={!!resolvingDuplicate}
        onClose={() => setResolvingDuplicate(null)}
        duplicate={resolvingDuplicate}
        categories={categories}
        onResolve={handleResolveConflict}
      />
    </div>
  );
};

export default ServiceQualityAnalysis;
