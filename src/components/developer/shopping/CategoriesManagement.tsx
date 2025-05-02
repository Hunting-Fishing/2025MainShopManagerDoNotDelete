
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  ChevronDown, 
  Edit, 
  Plus, 
  Search, 
  Trash, 
  Settings,
  ChevronRight,
  Tag,
  Wrench,
} from "lucide-react";
import { categories } from '@/data/toolCategories';
import { manufacturers } from '@/data/manufacturers';
import { Manufacturer, ToolCategory } from '@/types/affiliate';

const CategoriesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tool-categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [toolCategories, setToolCategories] = useState<ToolCategory[]>([]);
  const [manufacturerCategories, setManufacturerCategories] = useState<{[key: string]: Manufacturer[]}>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ToolCategory | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // For the edit dialog
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categorySubcategories, setCategorySubcategories] = useState<string[]>([]);
  const [newSubcategory, setNewSubcategory] = useState("");

  useEffect(() => {
    // Convert flat categories to ToolCategory objects
    const categoriesArray: ToolCategory[] = Object.entries(categories).map(([name, subcategories], index) => ({
      id: `cat-${index + 1}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: `Tools and equipment for ${name.toLowerCase()} systems and components`,
      subcategories: subcategories as string[],
      productCount: Math.floor(Math.random() * 100) + 20,
      imageUrl: `/images/categories/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      featured: index < 5
    }));
    setToolCategories(categoriesArray);

    // Group manufacturers by category
    const groupedManufacturers = manufacturers.reduce((acc, manufacturer) => {
      if (!acc[manufacturer.category]) {
        acc[manufacturer.category] = [];
      }
      acc[manufacturer.category].push(manufacturer);
      return acc;
    }, {} as {[key: string]: Manufacturer[]});
    
    setManufacturerCategories(groupedManufacturers);
  }, []);

  const filteredToolCategories = toolCategories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditCategory = (category: ToolCategory) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setCategorySubcategories(category.subcategories || []);
    setIsEditDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!currentCategory) return;

    const updatedCategories = toolCategories.map(cat => 
      cat.id === currentCategory.id 
        ? { 
            ...cat, 
            name: categoryName, 
            description: categoryDescription, 
            subcategories: categorySubcategories,
            slug: categoryName.toLowerCase().replace(/\s+/g, '-')
          } 
        : cat
    );
    
    setToolCategories(updatedCategories);
    setIsEditDialogOpen(false);
    // In a real app, you would save this to your backend
  };

  const handleAddSubcategory = () => {
    if (newSubcategory.trim() && !categorySubcategories.includes(newSubcategory)) {
      setCategorySubcategories([...categorySubcategories, newSubcategory]);
      setNewSubcategory("");
    }
  };

  const handleRemoveSubcategory = (subcategory: string) => {
    setCategorySubcategories(categorySubcategories.filter(sub => sub !== subcategory));
  };

  const handleDeleteCategory = (categoryId: string) => {
    // In a real app, you'd show a confirmation dialog
    setToolCategories(toolCategories.filter(cat => cat.id !== categoryId));
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add New Category
          </Button>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              className="pl-10 w-[250px]"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="tool-categories" className="flex items-center">
            <Wrench className="h-4 w-4 mr-2" />
            Tool Categories
          </TabsTrigger>
          <TabsTrigger value="manufacturer-categories" className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            Manufacturer Categories
          </TabsTrigger>
          <TabsTrigger value="featured-groups" className="flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Featured Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tool-categories">
          <Card>
            <CardHeader>
              <CardTitle>Tool Categories</CardTitle>
              <CardDescription>
                Manage the categories of tools shown in the shop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Category Name</TableHead>
                      <TableHead className="w-[400px]">Description</TableHead>
                      <TableHead className="text-center">Products</TableHead>
                      <TableHead className="text-center">Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredToolCategories.map((category) => (
                      <React.Fragment key={category.id}>
                        <TableRow className="cursor-pointer hover:bg-slate-50" onClick={() => toggleCategoryExpansion(category.id)}>
                          <TableCell className="font-medium flex items-center">
                            {expandedCategory === category.id ? 
                              <ChevronDown className="h-4 w-4 mr-2 text-blue-600" /> : 
                              <ChevronRight className="h-4 w-4 mr-2 text-gray-600" />
                            }
                            {category.name}
                          </TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell className="text-center">{category.productCount || 0}</TableCell>
                          <TableCell className="text-center">
                            {category.featured ? 
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">Featured</span> : 
                              "-"
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategory(category);
                              }}>
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}>
                                <Trash className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {expandedCategory === category.id && (
                          <TableRow className="bg-slate-50">
                            <TableCell colSpan={5} className="p-0">
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="text-sm font-semibold mb-2">Subcategories ({category.subcategories?.length || 0})</h3>
                                    <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                                      {category.subcategories && category.subcategories.length > 0 ? (
                                        <ul className="space-y-1">
                                          {category.subcategories.map((sub, idx) => (
                                            <li key={idx} className="text-sm py-1 px-2 hover:bg-slate-100 rounded flex justify-between items-center">
                                              {sub}
                                              <button className="text-red-500 hover:text-red-700">
                                                <Trash className="h-3 w-3" />
                                              </button>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-sm text-gray-500 py-2 text-center">No subcategories defined</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h3 className="text-sm font-semibold mb-2">Products in this Category</h3>
                                    <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                                      <p className="text-sm text-blue-600 underline cursor-pointer py-2 text-center">
                                        View {category.productCount} products in this category
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-2">
                                  <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Category
                                  </Button>
                                  <Button size="sm" variant="default">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Manage Products
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manufacturer-categories">
          <Card>
            <CardHeader>
              <CardTitle>Manufacturer Categories</CardTitle>
              <CardDescription>
                Manage manufacturers grouped by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="border rounded-md">
                {Object.entries(manufacturerCategories).map(([category, manufacturers], idx) => (
                  <AccordionItem key={idx} value={category}>
                    <AccordionTrigger className="px-4 hover:bg-slate-50">
                      <div className="flex justify-between items-center w-full pr-4">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-gray-500">
                          {manufacturers.length} manufacturers
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-center">Products</TableHead>
                              <TableHead className="text-center">Featured</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {manufacturers.map((manufacturer) => (
                              <TableRow key={manufacturer.id}>
                                <TableCell className="font-medium">{manufacturer.name}</TableCell>
                                <TableCell>{manufacturer.description || 'No description'}</TableCell>
                                <TableCell className="text-center">{manufacturer.productCount || 0}</TableCell>
                                <TableCell className="text-center">
                                  {manufacturer.featured ? 
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">Featured</span> : 
                                    "-"
                                  }
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end items-center space-x-2">
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Products</DropdownMenuItem>
                                        <DropdownMenuItem>Edit Manufacturer</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured-groups">
          <Card>
            <CardHeader>
              <CardTitle>Featured Groups</CardTitle>
              <CardDescription>
                Manage featured product collections and promotions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 hover:shadow-md transition-all">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-amber-500" />
                      Featured Tools
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Showcase highlighted tools across all categories</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                      <Button size="sm" variant="outline">Manage Products</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 hover:shadow-md transition-all">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-green-500" />
                      Best Selling Tools
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Collection of our most popular selling tools</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                      <Button size="sm" variant="outline">Manage Products</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 hover:shadow-md transition-all">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-blue-500" />
                      New Arrivals
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Recently added tools and equipment</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                      <Button size="sm" variant="outline">Manage Products</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 hover:shadow-md transition-all">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-red-500" />
                      Special Offers
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Discounted and promotional tools</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Inactive</span>
                      <Button size="sm" variant="outline">Manage Products</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Featured Group
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Make changes to the category details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input 
                id="name" 
                value={categoryName} 
                onChange={(e) => setCategoryName(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea 
                id="description" 
                value={categoryDescription} 
                onChange={(e) => setCategoryDescription(e.target.value)} 
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcategories</label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {categorySubcategories.length > 0 ? (
                  <ul className="space-y-1">
                    {categorySubcategories.map((sub, idx) => (
                      <li key={idx} className="flex justify-between items-center py-1 px-2 hover:bg-slate-100 rounded">
                        {sub}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveSubcategory(sub)}
                        >
                          <Trash className="h-3 w-3 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 py-2 text-center">No subcategories defined</p>
                )}
              </div>
              
              <div className="flex gap-2 mt-2">
                <Input 
                  placeholder="New subcategory" 
                  value={newSubcategory} 
                  onChange={(e) => setNewSubcategory(e.target.value)} 
                />
                <Button type="button" onClick={handleAddSubcategory}>Add</Button>
              </div>
            </div>
            
            {currentCategory?.featured !== undefined && (
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={!!currentCategory?.featured}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Featured Category
                </label>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManagement;
