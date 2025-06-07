import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Database,
  FolderOpen,
  FileText,
  Wrench
} from 'lucide-react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';

interface ServiceHierarchyTreeProps {
  categories: ServiceMainCategory[];
}

export function ServiceHierarchyTree({ categories }: ServiceHierarchyTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) {
      return categories;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(lowerQuery) ||
      category.subcategories.some(subcategory =>
        subcategory.name.toLowerCase().includes(lowerQuery) ||
        subcategory.jobs.some(job => job.name.toLowerCase().includes(lowerQuery))
      )
    );
  }, [categories, searchQuery]);

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const isCategoryExpanded = (categoryId: string) => {
    return expandedCategories.includes(categoryId);
  };

  const hasVisibleSubcategories = (category: ServiceMainCategory) => {
    return showHidden ? true : category.subcategories.length > 0;
  };

  const hasVisibleJobs = (subcategory: ServiceSubcategory) => {
    return showHidden ? true : subcategory.jobs.length > 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            Service Hierarchy
          </div>
          <Badge variant="secondary">
            {categories.length} Categories
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {filteredCategories.length === 0 && searchQuery && (
          <Alert variant="info">
            <AlertDescription>
              No categories found matching "<strong>{searchQuery}</strong>".
            </AlertDescription>
          </Alert>
        )}

        {filteredCategories.length === 0 && !searchQuery && (
          <Alert variant="warning">
            <AlertDescription>
              No service categories available. Please import service data.
            </AlertDescription>
          </Alert>
        )}

        {filteredCategories.length > 0 && (
          <div className="space-y-3">
            {filteredCategories.map(category => (
              <Collapsible key={category.id} className="w-full">
                <div className="border rounded-md">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full py-2 justify-between font-normal hover:bg-gray-100 data-[state=open]:bg-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        <ChevronRight
                          className="h-4 w-4 shrink-0 transition-transform duration-200 peer-data-[state=open]:rotate-90"
                        />
                        <span>{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.subcategories.length} Subcategories</Badge>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="py-2">
                        <div className="font-medium">{subcategory.name}</div>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          {subcategory.jobs.map(job => (
                            <li key={job.id}>{job.name}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
