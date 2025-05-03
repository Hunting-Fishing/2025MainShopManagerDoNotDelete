
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Edit, Trash2, Plus, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuidv4 } from 'uuid';

interface ServiceCategoryListProps {
  categories: ServiceMainCategory[];
  selectedCategory: ServiceMainCategory | null;
  onSelectCategory: (category: ServiceMainCategory) => void;
  onDeleteCategory: (id: string) => void;
}

export default function ServiceCategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
  onDeleteCategory
}: ServiceCategoryListProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: ServiceMainCategory) => {
    onSelectCategory(category);
    setExpandedCategory(category.id);
  };

  const handleAddCategory = () => {
    const newCategory: ServiceMainCategory = {
      id: uuidv4(),
      name: "",
      description: "",
      subcategories: [],
      position: categories.length
    };
    
    onSelectCategory(newCategory);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Categories
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-green-100 text-green-800 hover:bg-green-200"
                onClick={handleAddCategory}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Category
              </Button>
            </CardTitle>
            <CardDescription>Select a category to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 cursor-pointer rounded-lg border transition-all hover:border-blue-500 ${
                      selectedCategory?.id === category.id 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{category.name}</div>
                      <Badge variant="outline">
                        {category.subcategories.length} subcategories
                      </Badge>
                    </div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </div>
                    )}
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No categories found. Add your first category.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-1 md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedCategory ? selectedCategory.name || 'New Category' : 'Select a Category'}
            </CardTitle>
            <CardDescription>
              {selectedCategory 
                ? selectedCategory.id && categories.some(c => c.id === selectedCategory.id)
                  ? `${selectedCategory.subcategories.length} subcategories, ${selectedCategory.subcategories.reduce(
                      (count, subcat) => count + subcat.jobs.length, 0)} total jobs`
                  : 'Create a new service category'
                : 'Select a category to view its subcategories and jobs'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCategory ? (
              selectedCategory.id && categories.some(c => c.id === selectedCategory.id) ? (
                <Accordion 
                  type="single" 
                  collapsible 
                  className="w-full"
                  value={expandedCategory || undefined}
                  onValueChange={(value) => setExpandedCategory(value)}
                >
                  {selectedCategory.subcategories.map((subcategory) => (
                    <AccordionItem key={subcategory.id} value={subcategory.id}>
                      <AccordionTrigger className="hover:bg-slate-50 px-4 py-2 rounded-lg">
                        <div className="flex items-center justify-between w-full">
                          <div className="font-medium">{subcategory.name}</div>
                          <Badge variant="secondary" className="ml-2 mr-4">
                            {subcategory.jobs.length} jobs
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Job Name</TableHead>
                                <TableHead className="text-right">Est. Time</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {subcategory.jobs.map((job) => (
                                <TableRow key={job.id}>
                                  <TableCell>{job.name}</TableCell>
                                  <TableCell className="text-right">
                                    {job.estimatedTime 
                                      ? `${Math.floor(job.estimatedTime / 60)}h ${job.estimatedTime % 60}m` 
                                      : '-'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <ChevronRight className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Edit className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">
                                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {subcategory.jobs.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                                    No jobs found in this subcategory
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Fill in category details and save to create a new service category
                </div>
              )
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                Select a category from the list to view details
              </div>
            )}
          </CardContent>
          {selectedCategory && (
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit Category
              </Button>
              {selectedCategory.id && categories.some(c => c.id === selectedCategory.id) && (
                <Button 
                  variant="destructive" 
                  className="flex items-center gap-2"
                  onClick={() => onDeleteCategory(selectedCategory.id)}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
