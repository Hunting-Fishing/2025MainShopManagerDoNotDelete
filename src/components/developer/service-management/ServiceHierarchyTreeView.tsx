
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import ServiceJobEditor from './ServiceJobEditor';
import { ChevronRight, ChevronDown, Search, Edit2, FolderOpen, File, Building } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceHierarchyTreeViewProps {
  sectors: ServiceSector[];
  onSave: (data: any) => void;
}

export function ServiceHierarchyTreeView({ sectors, onSave }: ServiceHierarchyTreeViewProps) {
  const [expandedSectors, setExpandedSectors] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingJob, setEditingJob] = useState<ServiceJob | null>(null);

  // Filter sectors/categories/subcategories/jobs based on search - NO LIMITS
  const filteredSectors = useMemo(() => {
    if (!searchTerm) return sectors;

    return sectors.map(sector => {
      const filteredCategories = sector.categories.map(category => {
        const filteredSubcategories = category.subcategories.map(subcategory => {
          // Include ALL matching jobs - no limit
          const filteredJobs = subcategory.jobs.filter(job =>
            job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return { ...subcategory, jobs: filteredJobs };
        }).filter(subcategory => 
          subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subcategory.jobs.length > 0
        );

        return { ...category, subcategories: filteredSubcategories };
      }).filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subcategories.length > 0
      );

      return { ...sector, categories: filteredCategories };
    }).filter(sector => 
      sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.categories.length > 0
    );
  }, [sectors, searchTerm]);

  const toggleSector = (sectorId: string) => {
    setExpandedSectors(prev => 
      prev.includes(sectorId) 
        ? prev.filter(id => id !== sectorId)
        : [...prev, sectorId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const handleEditJob = (job: ServiceJob) => {
    setEditingJob(job);
  };

  const handleSaveJob = () => {
    setEditingJob(null);
    toast.success('Job updated successfully');
    onSave({ type: 'job_updated' });
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
  };

  const totalJobs = sectors.reduce((sum, sector) => 
    sum + sector.categories.reduce((catSum, cat) => 
      catSum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Service Hierarchy Tree View
            <Badge variant="secondary">{totalJobs} Total Jobs (Unlimited per subcategory)</Badge>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sectors, categories, subcategories, or jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredSectors.map((sector) => (
              <Collapsible 
                key={sector.id} 
                open={expandedSectors.includes(sector.id)}
                onOpenChange={() => toggleSector(sector.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-2 h-auto hover:bg-gray-50"
                  >
                    {expandedSectors.includes(sector.id) ? 
                      <ChevronDown className="h-4 w-4 mr-2" /> : 
                      <ChevronRight className="h-4 w-4 mr-2" />
                    }
                    <Building className="h-4 w-4 mr-2" />
                    <span className="font-medium">{sector.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {sector.categories.reduce((sum, cat) => 
                        sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0)} jobs
                    </Badge>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 space-y-1">
                  {sector.categories.map((category) => (
                    <Collapsible 
                      key={category.id}
                      open={expandedCategories.includes(category.id)}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start p-2 h-auto hover:bg-gray-50"
                        >
                          {expandedCategories.includes(category.id) ? 
                            <ChevronDown className="h-4 w-4 mr-2" /> : 
                            <ChevronRight className="h-4 w-4 mr-2" />
                          }
                          <FolderOpen className="h-4 w-4 mr-2" />
                          <span className="font-medium">{category.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {category.subcategories.reduce((sum, sub) => sum + sub.jobs.length, 0)} jobs
                          </Badge>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-6 space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <Collapsible 
                            key={subcategory.id}
                            open={expandedSubcategories.includes(subcategory.id)}
                            onOpenChange={() => toggleSubcategory(subcategory.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start p-2 h-auto hover:bg-gray-50"
                              >
                                {expandedSubcategories.includes(subcategory.id) ? 
                                  <ChevronDown className="h-4 w-4 mr-2" /> : 
                                  <ChevronRight className="h-4 w-4 mr-2" />
                                }
                                <FolderOpen className="h-4 w-4 mr-2" />
                                <span className="font-medium">{subcategory.name}</span>
                                <Badge 
                                  variant={subcategory.jobs.length > 50 ? "default" : "outline"} 
                                  className="ml-auto"
                                >
                                  {subcategory.jobs.length} jobs {subcategory.jobs.length > 50 ? "(Large dataset)" : ""}
                                </Badge>
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="ml-6 space-y-1">
                              {/* Display ALL jobs for this subcategory - no pagination or limits */}
                              {subcategory.jobs.map((job) => (
                                <div 
                                  key={job.id}
                                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border-l-2 border-gray-200"
                                >
                                  <div className="flex items-center space-x-2 flex-1">
                                    <File className="h-4 w-4 text-gray-400" />
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{job.name}</div>
                                      {job.description && (
                                        <div className="text-xs text-gray-500">{job.description}</div>
                                      )}
                                      <div className="flex items-center space-x-4 mt-1">
                                        {job.estimatedTime && (
                                          <span className="text-xs text-gray-500">
                                            {job.estimatedTime} min
                                          </span>
                                        )}
                                        {job.price && (
                                          <span className="text-xs font-medium text-green-600">
                                            ${job.price}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditJob(job)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {subcategory.jobs.length === 0 && (
                                <div className="text-sm text-gray-500 p-2">
                                  No jobs found
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingJob && (
        <ServiceJobEditor
          job={editingJob}
          onSave={handleSaveJob}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}
