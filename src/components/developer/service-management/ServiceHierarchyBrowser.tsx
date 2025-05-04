
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Check, ChevronRight, Edit, Plus, Search, Trash, ChevronDown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from "@/types/serviceHierarchy";
import { formatCurrency } from "@/lib/utils";
import { formatTime } from "@/lib/services/serviceUtils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  onSelectCategory: (category: ServiceMainCategory) => void;
  onSelectSubcategory: (category: ServiceMainCategory, subcategory: ServiceSubcategory) => void;
  onSelectJob: (category: ServiceMainCategory, subcategory: ServiceSubcategory, job: ServiceJob) => void;
  onAddCategory: () => void;
  onAddSubcategory: (categoryId: string) => void;
  onAddJob: (categoryId: string, subcategoryId: string) => void;
}

export const ServiceHierarchyBrowser: React.FC<ServiceHierarchyBrowserProps> = ({
  categories,
  onSelectCategory,
  onSelectSubcategory,
  onSelectJob,
  onAddCategory,
  onAddSubcategory,
  onAddJob
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(category => {
    // Check if the category name matches
    if (category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }
    
    // Check if any subcategory name matches
    const hasMatchingSubcategory = category.subcategories.some(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // Check if any job name matches
      sub.jobs.some(job => 
        job.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    
    return hasMatchingSubcategory;
  });

  // Calculate totals for a category
  const getCategoryStats = (category: ServiceMainCategory) => {
    let totalJobs = 0;
    let totalPrice = 0;
    let totalTime = 0;

    category.subcategories.forEach(sub => {
      totalJobs += sub.jobs.length;
      sub.jobs.forEach(job => {
        totalPrice += job.price || 0;
        totalTime += job.estimatedTime || 0;
      });
    });

    return { totalJobs, totalPrice, totalTime };
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-gradient-to-b from-blue-50 to-white pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-blue-700">Service Hierarchy</CardTitle>
          <Button 
            onClick={onAddCategory}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        </div>
        <CardDescription>
          Browse and manage all service categories, subcategories, and jobs
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services, subcategories, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[40%]">Name</TableHead>
                <TableHead className="w-[15%]">Items</TableHead>
                <TableHead className="w-[15%]">Est. Time</TableHead>
                <TableHead className="w-[15%]">Price</TableHead>
                <TableHead className="w-[15%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => {
                const isExpanded = expandedCategories[category.id] ?? false;
                const { totalJobs, totalPrice, totalTime } = getCategoryStats(category);
                
                return (
                  <React.Fragment key={category.id}>
                    <TableRow className="bg-blue-50/50 hover:bg-blue-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6"
                            onClick={() => toggleCategory(category.id)}
                          >
                            {isExpanded ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </Button>
                          <span 
                            className="ml-1 font-bold text-blue-800 hover:text-blue-600 cursor-pointer"
                            onClick={() => onSelectCategory(category)}
                          >
                            {category.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {category.subcategories.length} subcats
                        </Badge>
                        {totalJobs > 0 && (
                          <Badge variant="outline" className="ml-1 bg-amber-100 text-amber-800">
                            {totalJobs} jobs
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatTime(totalTime)}</TableCell>
                      <TableCell>{formatCurrency(totalPrice)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectCategory(category)}
                          className="h-8 w-8 text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAddSubcategory(category.id)}
                          className="h-8 w-8 text-green-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Render subcategories if category is expanded */}
                    {isExpanded && category.subcategories.map((subcategory) => {
                      const isSubExpanded = expandedSubcategories[subcategory.id] ?? false;
                      const totalSubTime = subcategory.jobs.reduce((total, job) => total + (job.estimatedTime || 0), 0);
                      const totalSubPrice = subcategory.jobs.reduce((total, job) => total + (job.price || 0), 0);

                      return (
                        <React.Fragment key={subcategory.id}>
                          <TableRow className="bg-gray-50 hover:bg-gray-100">
                            <TableCell className="font-medium">
                              <div className="flex items-center pl-6">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6"
                                  onClick={() => toggleSubcategory(subcategory.id)}
                                >
                                  {isSubExpanded ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                  }
                                </Button>
                                <span 
                                  className="ml-1 font-medium text-gray-800 hover:text-blue-600 cursor-pointer"
                                  onClick={() => onSelectSubcategory(category, subcategory)}
                                >
                                  {subcategory.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gray-100">
                                {subcategory.jobs.length} jobs
                              </Badge>
                            </TableCell>
                            <TableCell>{formatTime(totalSubTime)}</TableCell>
                            <TableCell>{formatCurrency(totalSubPrice)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onSelectSubcategory(category, subcategory)}
                                className="h-8 w-8 text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onAddJob(category.id, subcategory.id)}
                                className="h-8 w-8 text-green-700"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>

                          {/* Render jobs if subcategory is expanded */}
                          {isSubExpanded && subcategory.jobs.map((job) => (
                            <TableRow key={job.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <div className="flex items-center pl-14">
                                  <span 
                                    className="text-sm font-normal text-gray-600 hover:text-blue-600 cursor-pointer"
                                    onClick={() => onSelectJob(category, subcategory, job)}
                                  >
                                    {job.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>{formatTime(job.estimatedTime || 0)}</TableCell>
                              <TableCell>{formatCurrency(job.price || 0)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onSelectJob(category, subcategory, job)}
                                  className="h-8 w-8 text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No services found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
