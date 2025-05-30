import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  Save, 
  X,
  RefreshCw
} from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Color coding for different service categories
const categoryColorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  // Engine & Performance
  'engine': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  'performance': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  'turbo': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  
  // Exhaust System
  'exhaust': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-600' },
  'muffler': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-600' },
  
  // Cooling System
  'cooling': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'coolant': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'radiator': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'thermostat': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  
  // Brake System
  'brake': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  'brakes': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  
  // Suspension & Steering
  'suspension': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'steering': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'wheel': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'tire': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  
  // Electrical System
  'electrical': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  'battery': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  'alternator': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  'starter': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  
  // Transmission & Drivetrain
  'transmission': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  'drivetrain': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  'clutch': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  
  // Fuel System
  'fuel': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'injection': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  
  // Oil & Fluids
  'oil': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
  'fluid': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
  'lubrication': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
  
  // HVAC
  'air': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  'conditioning': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  'hvac': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  
  // Default
  'default': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' }
};

// Function to determine category color based on service name/category
const getCategoryColor = (categoryName: string, serviceName: string = ''): typeof categoryColorMap.default => {
  const searchText = `${categoryName} ${serviceName}`.toLowerCase();
  
  for (const [key, colors] of Object.entries(categoryColorMap)) {
    if (key !== 'default' && searchText.includes(key)) {
      return colors;
    }
  }
  
  return categoryColorMap.default;
};

interface QualityIssue {
  id: string;
  type: 'duplicate' | 'naming' | 'structure' | 'recommendation';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  category: string;
  subcategory?: string;
  affectedItems: string[];
}

interface ServiceQualityAnalysisProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

const ServiceQualityAnalysis: React.FC<ServiceQualityAnalysisProps> = ({
  categories,
  onRefresh
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [editingIssue, setEditingIssue] = useState<QualityIssue | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const analyzeServiceQuality = (): QualityIssue[] => {
    const issues: QualityIssue[] = [];
    const allServices: { name: string; category: string; subcategory: string }[] = [];

    // Collect all services
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          allServices.push({
            name: job.name,
            category: category.name,
            subcategory: subcategory.name
          });
        });
      });
    });

    // Find duplicates
    const serviceNames = allServices.map(s => s.name.toLowerCase());
    const duplicates = serviceNames.filter((name, index) => serviceNames.indexOf(name) !== index);
    
    duplicates.forEach(duplicate => {
      const duplicateServices = allServices.filter(s => s.name.toLowerCase() === duplicate);
      if (duplicateServices.length > 1) {
        issues.push({
          id: `duplicate-${duplicate}`,
          type: 'duplicate',
          severity: 'high',
          title: `Duplicate Service: ${duplicateServices[0].name}`,
          description: `Service "${duplicateServices[0].name}" appears in multiple locations`,
          recommendation: 'Consolidate duplicate services into a single location',
          category: duplicateServices[0].category,
          subcategory: duplicateServices[0].subcategory,
          affectedItems: duplicateServices.map(s => `${s.category} > ${s.subcategory}`)
        });
      }
    });

    // Find naming issues
    allServices.forEach(service => {
      if (service.name.length < 3) {
        issues.push({
          id: `naming-short-${service.name}`,
          type: 'naming',
          severity: 'medium',
          title: `Short Service Name: ${service.name}`,
          description: `Service name "${service.name}" is too short and may be unclear`,
          recommendation: 'Use more descriptive service names',
          category: service.category,
          subcategory: service.subcategory,
          affectedItems: [service.name]
        });
      }

      if (service.name.includes('&') || service.name.includes('+')) {
        issues.push({
          id: `naming-compound-${service.name}`,
          type: 'naming',
          severity: 'low',
          title: `Compound Service: ${service.name}`,
          description: `Service "${service.name}" appears to combine multiple services`,
          recommendation: 'Consider splitting into separate services',
          category: service.category,
          subcategory: service.subcategory,
          affectedItems: [service.name]
        });
      }
    });

    // Structure recommendations
    categories.forEach(category => {
      if (category.subcategories.length > 10) {
        issues.push({
          id: `structure-large-${category.name}`,
          type: 'structure',
          severity: 'medium',
          title: `Large Category: ${category.name}`,
          description: `Category "${category.name}" has ${category.subcategories.length} subcategories`,
          recommendation: 'Consider splitting large categories for better organization',
          category: category.name,
          affectedItems: [`${category.subcategories.length} subcategories`]
        });
      }

      category.subcategories.forEach(subcategory => {
        if (subcategory.jobs.length > 15) {
          issues.push({
            id: `structure-large-sub-${subcategory.name}`,
            type: 'structure',
            severity: 'low',
            title: `Large Subcategory: ${subcategory.name}`,
            description: `Subcategory "${subcategory.name}" has ${subcategory.jobs.length} services`,
            recommendation: 'Consider splitting large subcategories',
            category: category.name,
            subcategory: subcategory.name,
            affectedItems: [`${subcategory.jobs.length} services`]
          });
        }
      });
    });

    return issues;
  };

  const qualityIssues = useMemo(() => analyzeServiceQuality(), [categories]);

  const filteredIssues = qualityIssues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectIssue = (issueId: string, checked: boolean) => {
    if (checked) {
      setSelectedIssues(prev => [...prev, issueId]);
    } else {
      setSelectedIssues(prev => prev.filter(id => id !== issueId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIssues(filteredIssues.map(issue => issue.id));
    } else {
      setSelectedIssues([]);
    }
  };

  const handleDeleteSelected = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    toast({
      title: "Issues Resolved",
      description: `${selectedIssues.length} quality issues marked as resolved.`
    });
    setSelectedIssues([]);
    setShowDeleteDialog(false);
  };

  const handleEditIssue = (issue: QualityIssue) => {
    setEditingIssue({ ...issue });
  };

  const handleSaveEdit = () => {
    if (editingIssue) {
      toast({
        title: "Issue Updated",
        description: "Quality issue has been updated successfully."
      });
      setEditingIssue(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'duplicate': return <AlertTriangle className="h-4 w-4" />;
      case 'naming': return <Edit className="h-4 w-4" />;
      case 'structure': return <RefreshCw className="h-4 w-4" />;
      case 'recommendation': return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Service Quality Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Analyze your service hierarchy for duplicates, naming issues, and optimization opportunities
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Re-analyze
        </Button>
      </div>

      {/* Color Legend */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3">Service Category Color Coding</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Engine/Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
            <span>Exhaust System</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Cooling System</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Brake System</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Suspension/Wheels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Electrical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Transmission</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span>Fuel System</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500"></div>
            <span>Oil/Fluids</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span>HVAC</span>
          </div>
        </div>
      </Card>

      {/* Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search quality issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(selectedIssues.length !== filteredIssues.length)}
          >
            {selectedIssues.length === filteredIssues.length ? 'Deselect All' : 'Select All'}
          </Button>
          {selectedIssues.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Resolve Selected ({selectedIssues.length})
            </Button>
          )}
        </div>
      </div>

      {/* Quality Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Great Job!</h3>
            <p className="text-muted-foreground">
              No quality issues found in your service hierarchy.
            </p>
          </Card>
        ) : (
          filteredIssues.map((issue) => {
            const categoryColors = getCategoryColor(issue.category, issue.title);
            
            return (
              <Card 
                key={issue.id} 
                className={`p-4 border-l-4 ${categoryColors.border} ${categoryColors.bg}`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedIssues.includes(issue.id)}
                    onCheckedChange={(checked) => handleSelectIssue(issue.id, checked as boolean)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${categoryColors.dot}`}></div>
                        {getTypeIcon(issue.type)}
                        <h4 className={`font-medium ${categoryColors.text}`}>{issue.title}</h4>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditIssue(issue)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className={`text-sm ${categoryColors.text} opacity-80`}>
                      {issue.description}
                    </p>
                    
                    <div className={`text-sm ${categoryColors.text} opacity-60`}>
                      <strong>Category:</strong> {issue.category}
                      {issue.subcategory && (
                        <>
                          {' > '}
                          <strong>Subcategory:</strong> {issue.subcategory}
                        </>
                      )}
                    </div>
                    
                    <div className={`text-sm ${categoryColors.text} opacity-60`}>
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </div>
                    
                    {issue.affectedItems.length > 0 && (
                      <div className={`text-sm ${categoryColors.text} opacity-60`}>
                        <strong>Affected:</strong> {issue.affectedItems.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Issue Dialog */}
      <Dialog open={!!editingIssue} onOpenChange={() => setEditingIssue(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Quality Issue</DialogTitle>
            <DialogDescription>
              Modify the details of this quality issue.
            </DialogDescription>
          </DialogHeader>
          
          {editingIssue && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingIssue.title}
                  onChange={(e) => setEditingIssue({
                    ...editingIssue,
                    title: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingIssue.description}
                  onChange={(e) => setEditingIssue({
                    ...editingIssue,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Recommendation</label>
                <Textarea
                  value={editingIssue.recommendation}
                  onChange={(e) => setEditingIssue({
                    ...editingIssue,
                    recommendation: e.target.value
                  })}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIssue(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Selected Issues</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {selectedIssues.length} quality issues as resolved?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceQualityAnalysis;
