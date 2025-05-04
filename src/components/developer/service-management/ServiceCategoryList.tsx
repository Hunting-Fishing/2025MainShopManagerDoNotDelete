
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, ChevronRight, Check, Filter, Search, PlusCircle, Eye } from 'lucide-react';
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ServiceCategoryListProps {
  categories: ServiceMainCategory[];
  onSelectCategory: (category: ServiceMainCategory) => void;
  onDeleteCategory: (id: string) => void;
  selectedCategory: ServiceMainCategory | null;
}

const ServiceCategoryList: React.FC<ServiceCategoryListProps> = ({
  categories,
  onSelectCategory,
  onDeleteCategory,
  selectedCategory
}) => {
  // Sort categories by position
  const sortedCategories = [...categories].sort((a, b) => 
    (a.position ?? 0) - (b.position ?? 0)
  );

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmptySubcategories, setShowEmptySubcategories] = useState(false);

  // Get total jobs count for a category
  const getTotalJobsCount = (category: ServiceMainCategory) => {
    return category.subcategories.reduce(
      (total, subcategory) => total + subcategory.jobs.length, 
      0
    );
  };

  // Filter categories based on search term
  const filteredCategories = sortedCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesSearch;
  });

  // Create a default tab value from the first category name or use selected category
  const defaultTab = selectedCategory ? selectedCategory.name : 
    filteredCategories.length > 0 ? filteredCategories[0].name : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search categories and services..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowEmptySubcategories(!showEmptySubcategories)}
          >
            <Filter className="h-4 w-4" />
            <span>Empty: {showEmptySubcategories ? "Showing" : "Hidden"}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setShowEmptySubcategories(!showEmptySubcategories)}>
                  {showEmptySubcategories ? <Eye className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2 text-muted-foreground" />}
                  <span>Show empty subcategories</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredCategories.length > 0 ? (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full mb-6 flex flex-wrap h-auto py-2 gap-2 bg-muted">
            {filteredCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.name}
                className="relative px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-indigo-100 data-[state=active]:text-indigo-700 data-[state=active]:border-b-2 data-[state=active]:border-indigo-700 transition-all"
                onClick={() => onSelectCategory(category)}
              >
                <div className="flex items-center gap-2">
                  <span>{category.name}</span>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {getTotalJobsCount(category)}
                  </Badge>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {filteredCategories.map((category) => (
            <TabsContent key={category.id} value={category.name} className="mt-6 animate-fade-in">
              <Card className="border-indigo-200 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 border-b pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-800">
                      {category.name}
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border border-indigo-300">
                        {getTotalJobsCount(category)} {getTotalJobsCount(category) === 1 ? 'service' : 'services'}
                      </Badge>
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(category.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span>Delete</span>
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategory(category);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span>Edit</span>
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.subcategories.map(subcategory => (
                      <div 
                        key={subcategory.id} 
                        className="bg-white border rounded-md p-4 shadow-sm hover:shadow-md transition-all hover:border-indigo-300"
                      >
                        <h4 className="font-medium text-sm mb-2 border-b pb-2 flex items-center justify-between">
                          <span>{subcategory.name}</span>
                          <Badge variant={subcategory.jobs.length > 0 ? "default" : "outline"} className={subcategory.jobs.length > 0 
                            ? "bg-blue-500 hover:bg-blue-600 text-xs" 
                            : "bg-gray-100 text-gray-500 text-xs"}>
                            {subcategory.jobs.length}
                          </Badge>
                        </h4>
                        <div className="space-y-2">
                          {subcategory.jobs.map(job => (
                            <div key={job.id} className="text-sm flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50">
                              <ChevronRight className="h-3 w-3 text-indigo-500" />
                              <span className="flex-grow">{job.name}</span>
                              {job.estimatedTime && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {Math.floor(job.estimatedTime / 60)}h {job.estimatedTime % 60}m
                                </Badge>
                              )}
                              {job.price && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  ${job.price.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          ))}
                          {(subcategory.jobs.length === 0 && showEmptySubcategories) && (
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-dashed border-gray-300">
                              <span className="text-xs text-muted-foreground italic">No services in this category</span>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600">
                                <PlusCircle className="h-3 w-3 mr-1" />
                                Add Service
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {category.subcategories.length === 0 && (
                      <div className="col-span-full text-center p-8 border border-dashed rounded-md bg-gray-50">
                        <p className="text-muted-foreground">No subcategories defined</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add Subcategory
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center p-8 border rounded-md bg-gradient-to-b from-gray-50 to-white border-dashed">
          <p className="text-muted-foreground mb-2">{searchTerm ? "No matching service categories found" : "No service categories found"}</p>
          <p className="text-sm mt-2 text-gray-500">Try importing categories from an Excel file or create a new one</p>
          <Button variant="default" size="sm" className="mt-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600">
            <PlusCircle className="h-4 w-4 mr-1" />
            Create New Category
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceCategoryList;
