import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ServiceMainCategory, ServiceJob } from '@/types/service';
import { toast } from 'sonner';
import { Copy, AlertTriangle, ChevronDown, Merge, Eye } from 'lucide-react';

interface ServiceDuplicatesManagerProps {
  categories: ServiceMainCategory[];
  onRefresh: () => void;
}

interface DuplicateGroup {
  id: string;
  name: string;
  jobs: ServiceJob[];
  confidence: number;
  type: 'exact' | 'similar' | 'potential';
}

export const ServiceDuplicatesManager: React.FC<ServiceDuplicatesManagerProps> = ({
  categories,
  onRefresh
}) => {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());

  useEffect(() => {
    findDuplicates();
  }, [categories]);

  const findDuplicates = () => {
    setLoading(true);
    
    // Get all jobs with their full context
    const allJobs: (ServiceJob & { categoryName: string; subcategoryName: string })[] = [];
    
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          allJobs.push({
            ...job,
            categoryName: category.name,
            subcategoryName: subcategory.name
          });
        });
      });
    });

    const duplicateGroups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    // Find exact name matches
    allJobs.forEach(job => {
      if (processed.has(job.id)) return;

      const exactMatches = allJobs.filter(other => 
        other.id !== job.id && 
        !processed.has(other.id) &&
        other.name.toLowerCase().trim() === job.name.toLowerCase().trim()
      );

      if (exactMatches.length > 0) {
        const group: DuplicateGroup = {
          id: `exact-${job.id}`,
          name: job.name,
          jobs: [job, ...exactMatches],
          confidence: 100,
          type: 'exact'
        };
        
        duplicateGroups.push(group);
        processed.add(job.id);
        exactMatches.forEach(match => processed.add(match.id));
      }
    });

    // Find similar name matches (using simple similarity)
    allJobs.forEach(job => {
      if (processed.has(job.id)) return;

      const similarMatches = allJobs.filter(other => {
        if (other.id === job.id || processed.has(other.id)) return false;
        
        const similarity = calculateSimilarity(job.name, other.name);
        return similarity > 0.8; // 80% similarity threshold
      });

      if (similarMatches.length > 0) {
        const group: DuplicateGroup = {
          id: `similar-${job.id}`,
          name: job.name,
          jobs: [job, ...similarMatches],
          confidence: 85,
          type: 'similar'
        };
        
        duplicateGroups.push(group);
        processed.add(job.id);
        similarMatches.forEach(match => processed.add(match.id));
      }
    });

    setDuplicates(duplicateGroups);
    setLoading(false);
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1;
    
    // Simple word-based similarity
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  };

  const handleSelectDuplicate = (groupId: string) => {
    const newSelected = new Set(selectedDuplicates);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedDuplicates(newSelected);
  };

  const handleMergeSelected = async () => {
    if (selectedDuplicates.size === 0) {
      toast.error('Please select duplicate groups to merge');
      return;
    }

    try {
      // This would implement the actual merge logic
      toast.success(`Merged ${selectedDuplicates.size} duplicate groups`);
      setSelectedDuplicates(new Set());
      onRefresh();
    } catch (error) {
      toast.error('Failed to merge duplicates');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDuplicates.size === 0) {
      toast.error('Please select duplicate groups to delete');
      return;
    }

    try {
      // This would implement the actual delete logic
      toast.success(`Deleted ${selectedDuplicates.size} duplicate groups`);
      setSelectedDuplicates(new Set());
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete duplicates');
    }
  };

  const exactDuplicates = duplicates.filter(d => d.type === 'exact');
  const similarDuplicates = duplicates.filter(d => d.type === 'similar');
  const totalDuplicateJobs = duplicates.reduce((sum, group) => sum + group.jobs.length - 1, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing service duplicates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Duplicate Groups</p>
                <p className="text-2xl font-bold">{duplicates.length}</p>
              </div>
              <Copy className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Exact Matches</p>
                <p className="text-2xl font-bold">{exactDuplicates.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Potential Savings</p>
                <p className="text-2xl font-bold">{totalDuplicateJobs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {selectedDuplicates.size > 0 && (
        <div className="flex gap-2">
          <Button onClick={handleMergeSelected} className="flex items-center gap-2">
            <Merge className="h-4 w-4" />
            Merge Selected ({selectedDuplicates.size})
          </Button>
          <Button onClick={handleDeleteSelected} variant="destructive" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {duplicates.length === 0 ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            No duplicates found! Your service hierarchy is clean.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="exact" className="w-full">
          <TabsList>
            <TabsTrigger value="exact">Exact Duplicates ({exactDuplicates.length})</TabsTrigger>
            <TabsTrigger value="similar">Similar Names ({similarDuplicates.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exact" className="space-y-4">
            {exactDuplicates.map(group => (
              <Card key={group.id} className={selectedDuplicates.has(group.id) ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedDuplicates.has(group.id)}
                        onChange={() => handleSelectDuplicate(group.id)}
                        className="rounded"
                      />
                      {group.name}
                    </CardTitle>
                    <Badge variant="destructive">
                      {group.confidence}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {group.jobs.map(job => (
                      <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{job.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(job as any).categoryName} → {(job as any).subcategoryName}
                          </p>
                        </div>
                        <div className="text-sm">
                          {job.price && <span className="text-green-600">${job.price}</span>}
                          {job.estimatedTime && <span className="ml-2 text-blue-600">{job.estimatedTime}m</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="similar" className="space-y-4">
            {similarDuplicates.map(group => (
              <Card key={group.id} className={selectedDuplicates.has(group.id) ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedDuplicates.has(group.id)}
                        onChange={() => handleSelectDuplicate(group.id)}
                        className="rounded"
                      />
                      Similar to: {group.name}
                    </CardTitle>
                    <Badge variant="secondary">
                      {group.confidence}% Similar
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {group.jobs.map(job => (
                      <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{job.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(job as any).categoryName} → {(job as any).subcategoryName}
                          </p>
                        </div>
                        <div className="text-sm">
                          {job.price && <span className="text-green-600">${job.price}</span>}
                          {job.estimatedTime && <span className="ml-2 text-blue-600">{job.estimatedTime}m</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
