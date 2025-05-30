
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Search,
  FileText,
  Trash2,
  Edit,
  Save,
  X
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { 
  findServiceDuplicates, 
  generateDuplicateRecommendations,
  DuplicateItem 
} from '@/utils/search/duplicateSearch';

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

interface QualityIssue {
  id: string;
  type: 'duplicate' | 'naming' | 'structure' | 'pricing';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedItems: string[];
  recommendation: string;
  itemType: 'category' | 'subcategory' | 'job';
  itemId?: string;
  path?: string;
}

interface EditDialogState {
  isOpen: boolean;
  item: QualityIssue | null;
  editedTitle: string;
  editedDescription: string;
  editedRecommendation: string;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    item: null,
    editedTitle: '',
    editedDescription: '',
    editedRecommendation: ''
  });

  // Analyze service hierarchy for quality issues
  const qualityAnalysis = useMemo(() => {
    const duplicates = findServiceDuplicates(categories);
    const issues: QualityIssue[] = [];

    // Convert duplicates to quality issues
    duplicates.forEach((duplicate, index) => {
      issues.push({
        id: `duplicate-${index}`,
        type: 'duplicate',
        severity: duplicate.occurrences.length > 3 ? 'high' : duplicate.occurrences.length > 2 ? 'medium' : 'low',
        title: `Duplicate ${duplicate.type}: "${duplicate.name}"`,
        description: `Found ${duplicate.occurrences.length} instances of "${duplicate.name}"`,
        affectedItems: duplicate.occurrences.map(occ => occ.path),
        recommendation: `Consider consolidating or renaming duplicate ${duplicate.type}s`,
        itemType: duplicate.type,
        path: duplicate.occurrences[0]?.path
      });
    });

    // Analyze naming consistency
    categories.forEach(category => {
      // Check for vague category names
      if (category.name.length < 3 || /^(misc|other|general)$/i.test(category.name)) {
        issues.push({
          id: `naming-category-${category.id}`,
          type: 'naming',
          severity: 'medium',
          title: `Vague category name: "${category.name}"`,
          description: 'Category name is too generic or short',
          affectedItems: [category.name],
          recommendation: 'Use more specific, descriptive category names',
          itemType: 'category',
          itemId: category.id,
          path: category.name
        });
      }

      category.subcategories.forEach(subcategory => {
        // Check for jobs without descriptions
        const jobsWithoutDesc = subcategory.jobs.filter(job => !job.description || job.description.trim().length === 0);
        if (jobsWithoutDesc.length > 0) {
          issues.push({
            id: `structure-jobs-${subcategory.id}`,
            type: 'structure',
            severity: 'low',
            title: `${jobsWithoutDesc.length} jobs missing descriptions in "${subcategory.name}"`,
            description: 'Jobs without descriptions make it harder for customers to understand services',
            affectedItems: jobsWithoutDesc.map(job => `${category.name} > ${subcategory.name} > ${job.name}`),
            recommendation: 'Add clear descriptions to all service jobs',
            itemType: 'job',
            path: `${category.name} > ${subcategory.name}`
          });
        }

        // Check for pricing inconsistencies
        const jobsWithoutPrice = subcategory.jobs.filter(job => !job.price || job.price === 0);
        if (jobsWithoutPrice.length > 0) {
          issues.push({
            id: `pricing-jobs-${subcategory.id}`,
            type: 'pricing',
            severity: 'medium',
            title: `${jobsWithoutPrice.length} jobs missing pricing in "${subcategory.name}"`,
            description: 'Jobs without pricing information can cause confusion during estimates',
            affectedItems: jobsWithoutPrice.map(job => `${category.name} > ${subcategory.name} > ${job.name}`),
            recommendation: 'Set appropriate prices for all service jobs',
            itemType: 'job',
            path: `${category.name} > ${subcategory.name}`
          });
        }
      });
    });

    return {
      issues,
      summary: {
        total: issues.length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
        duplicates: issues.filter(i => i.type === 'duplicate').length,
        naming: issues.filter(i => i.type === 'naming').length,
        structure: issues.filter(i => i.type === 'structure').length,
        pricing: issues.filter(i => i.type === 'pricing').length
      }
    };
  }, [categories]);

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(qualityAnalysis.issues.map(issue => issue.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    
    // In a real implementation, you would call an API to delete the selected items
    console.log('Deleting selected items:', Array.from(selectedItems));
    
    // For now, just clear the selection
    setSelectedItems(new Set());
    
    // Trigger a refresh to update the data
    onRefresh();
  };

  const handleEditItem = (item: QualityIssue) => {
    setEditDialog({
      isOpen: true,
      item,
      editedTitle: item.title,
      editedDescription: item.description,
      editedRecommendation: item.recommendation
    });
  };

  const handleSaveEdit = () => {
    if (!editDialog.item) return;
    
    // In a real implementation, you would save the edited item to the database
    console.log('Saving edited item:', {
      id: editDialog.item.id,
      title: editDialog.editedTitle,
      description: editDialog.editedDescription,
      recommendation: editDialog.editedRecommendation
    });
    
    setEditDialog({
      isOpen: false,
      item: null,
      editedTitle: '',
      editedDescription: '',
      editedRecommendation: ''
    });
    
    onRefresh();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'duplicate': return <Search className="h-4 w-4" />;
      case 'naming': return <FileText className="h-4 w-4" />;
      case 'structure': return <TrendingUp className="h-4 w-4" />;
      case 'pricing': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Service Quality Analysis
          </CardTitle>
          <CardDescription>
            Analyze your service hierarchy for duplicates, inconsistencies, and improvement opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No service categories found. Please import or create service categories first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{qualityAnalysis.summary.total}</p>
                <p className="text-sm text-gray-600">Total Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{qualityAnalysis.summary.high}</p>
                <p className="text-sm text-gray-600">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{qualityAnalysis.summary.medium}</p>
                <p className="text-sm text-gray-600">Medium Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{qualityAnalysis.summary.duplicates}</p>
                <p className="text-sm text-gray-600">Duplicates Found</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedItems.size === qualityAnalysis.issues.length && qualityAnalysis.issues.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">
                {selectedItems.size} of {qualityAnalysis.issues.length} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedItems.size === 0}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedItems.size})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Issues</CardTitle>
          <CardDescription>
            Issues found in your service hierarchy that may need attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qualityAnalysis.issues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-600">No Issues Found!</h3>
              <p className="text-gray-600">Your service hierarchy looks well-organized.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {qualityAnalysis.issues.map((issue) => (
                <div 
                  key={issue.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedItems.has(issue.id)}
                      onCheckedChange={(checked) => handleSelectItem(issue.id, checked as boolean)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(issue.type)}
                        <h4 className="font-medium">{issue.title}</h4>
                        <Badge variant={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline">
                          {issue.type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                      
                      {issue.path && (
                        <p className="text-xs text-blue-600 mb-2">
                          📍 {issue.path}
                        </p>
                      )}
                      
                      <div className="text-sm">
                        <p className="font-medium text-green-700 mb-1">Recommendation:</p>
                        <p className="text-green-600">{issue.recommendation}</p>
                      </div>
                      
                      {issue.affectedItems.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                            View affected items ({issue.affectedItems.length})
                          </summary>
                          <ul className="mt-2 text-sm text-gray-600 space-y-1 ml-4">
                            {issue.affectedItems.slice(0, 5).map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                {item}
                              </li>
                            ))}
                            {issue.affectedItems.length > 5 && (
                              <li className="text-gray-500 italic">
                                ... and {issue.affectedItems.length - 5} more
                              </li>
                            )}
                          </ul>
                        </details>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItem(issue)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => 
        setEditDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Quality Issue</DialogTitle>
            <DialogDescription>
              Modify the details of this quality issue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editDialog.editedTitle}
                onChange={(e) => setEditDialog(prev => ({ ...prev, editedTitle: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDialog.editedDescription}
                onChange={(e) => setEditDialog(prev => ({ ...prev, editedDescription: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-recommendation">Recommendation</Label>
              <Textarea
                id="edit-recommendation"
                value={editDialog.editedRecommendation}
                onChange={(e) => setEditDialog(prev => ({ ...prev, editedRecommendation: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setEditDialog(prev => ({ ...prev, isOpen: false }))}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceQualityAnalysis;
