
import React, { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye, 
  EyeOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServiceFiltering } from '@/hooks/useServiceFiltering';
import { ServiceAdvancedFilters } from './ServiceAdvancedFilters';
import { toast } from 'sonner';

interface ServiceCategoriesManagerProps {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  onRefresh: () => void;
}

const ServiceCategoriesManager: React.FC<ServiceCategoriesManagerProps> = ({
  categories,
  isLoading,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    filters,
    filteredJobs,
    filterStats,
    updateFilters,
    resetFilters
  } = useServiceFiltering(categories);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryAction = (action: string, categoryId: string) => {
    switch (action) {
      case 'edit':
        toast.info(`Edit category ${categoryId} - Feature coming soon`);
        break;
      case 'delete':
        toast.info(`Delete category ${categoryId} - Feature coming soon`);
        break;
      case 'duplicate':
        toast.info(`Duplicate category ${categoryId} - Feature coming soon`);
        break;
      default:
        break;
    }
  };

  const handleAddCategory = () => {
    toast.info('Add new category - Feature coming soon');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading service categories...</span>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No service categories found. Start by adding your first category.
          </AlertDescription>
        </Alert>
        <Button onClick={handleAddCategory} className="gap-2">
          <Plus className="h-4 w-4" />
          Add First Category
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Service Categories</h3>
          <p className="text-sm text-gray-600">
            Manage your service hierarchy and organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button onClick={handleAddCategory} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <ServiceAdvancedFilters
          filters={filters}
          onFiltersChange={updateFilters}
          categories={categories}
          onReset={resetFilters}
        />
      )}

      {/* Filter Stats */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filterStats.filteredJobs}</div>
              <div className="text-sm text-gray-600">Filtered Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filterStats.totalJobs}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filterStats.jobsWithPrice}</div>
              <div className="text-sm text-gray-600">With Prices</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filterStats.categoriesWithJobs}</div>
              <div className="text-sm text-gray-600">Active Categories</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories List */}
      <div className="grid gap-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {category.subcategories.length} subcategories
                  </Badge>
                  <Badge variant="secondary">
                    {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} jobs
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCategoryAction('edit', category.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCategoryAction('duplicate', category.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleCategoryAction('delete', category.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{subcategory.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {subcategory.jobs.length} jobs
                      </Badge>
                    </div>
                    {subcategory.description && (
                      <p className="text-sm text-gray-600 mb-2">{subcategory.description}</p>
                    )}
                    {subcategory.jobs.length > 0 && (
                      <div className="space-y-1">
                        {subcategory.jobs.slice(0, 3).map((job) => (
                          <div key={job.id} className="flex items-center justify-between text-sm">
                            <span>{job.name}</span>
                            <div className="flex items-center gap-2">
                              {job.price && (
                                <Badge variant="secondary" className="text-xs">
                                  ${job.price}
                                </Badge>
                              )}
                              {job.estimatedTime && (
                                <Badge variant="outline" className="text-xs">
                                  {job.estimatedTime}min
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {subcategory.jobs.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{subcategory.jobs.length - 3} more jobs
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {category.subcategories.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This category has no subcategories. Add some to organize your services.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && searchQuery && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No categories found matching "{searchQuery}". Try adjusting your search terms.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ServiceCategoriesManager;
