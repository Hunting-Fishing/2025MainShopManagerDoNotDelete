
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { ToolCategory, Manufacturer, FeaturedGroup } from "@/types/affiliate";
import { toast } from "@/hooks/use-toast";
import { manufacturers } from "@/data/manufacturers";
import { generateManufacturerProducts } from "@/data/manufacturers/productGenerator";
import ProductsList from "./ProductsList";
import { useProductsManager } from "@/hooks/affiliate/useProductsManager";

// Sample data for tool categories
const toolCategories: ToolCategory[] = [
  {
    id: "engine",
    name: "Engine",
    slug: "engine",
    description: "Tools for engine maintenance and repair",
    subcategories: ["Pistons", "Valves", "Timing Belts", "Oil System"],
    imageUrl: "https://example.com/images/engine-tools.jpg",
    featured: true,
    productCount: 42
  },
  {
    id: "brakes",
    name: "Brakes",
    slug: "brakes",
    description: "Tools for brake system maintenance and repair",
    subcategories: ["Pads", "Rotors", "Calipers", "Fluid Systems"],
    imageUrl: "https://example.com/images/brake-tools.jpg",
    featured: true,
    productCount: 38
  },
  {
    id: "diagnostics",
    name: "Diagnostics",
    slug: "diagnostics",
    description: "Diagnostic tools and equipment",
    subcategories: ["OBD Scanners", "Multimeters", "Pressure Testers"],
    imageUrl: "https://example.com/images/diagnostic-tools.jpg",
    featured: false,
    productCount: 29
  }
];

// Sample data for featured groups
const featuredGroups: FeaturedGroup[] = [
  {
    id: "new-arrivals",
    name: "New Arrivals",
    description: "Latest tools and equipment added to our catalog",
    slug: "new-arrivals",
    toolIds: ["t1", "t2", "t3"],
    priority: 1,
    active: true,
    startDate: "2025-05-01",
    endDate: "2025-06-01"
  },
  {
    id: "best-sellers",
    name: "Best Sellers",
    description: "Our most popular tools",
    slug: "best-sellers",
    toolIds: ["t3", "t4", "t5"],
    priority: 2,
    active: true
  },
  {
    id: "seasonal-promo",
    name: "Summer Specials",
    description: "Special promotional tools for summer maintenance",
    slug: "summer-specials",
    toolIds: ["t6", "t7", "t8"],
    priority: 3,
    active: false,
    startDate: "2025-06-01",
    endDate: "2025-09-01"
  }
];

const CategoriesManagement = () => {
  const [activeTab, setActiveTab] = useState("tool-categories");
  const [toolCats, setToolCats] = useState<ToolCategory[]>(toolCategories);
  const [manufacturerCats, setManufacturerCats] = useState<Manufacturer[]>(manufacturers);
  const [featuredCats, setFeaturedCats] = useState<FeaturedGroup[]>(featuredGroups);
  
  const [newToolCategory, setNewToolCategory] = useState({ name: '', description: '', subcategories: '' });
  const [newManufacturerCategory, setNewManufacturerCategory] = useState({ name: '', description: '', category: 'automotive' });
  const [newFeaturedGroup, setNewFeaturedGroup] = useState({ name: '', description: '' });
  
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<string | null>(null);

  const { products: selectedCategoryProducts, loading, updateProduct } = useProductsManager({
    categoryType: 'tool',
    categoryName: expandedProducts || undefined
  });

  const toggleEditItem = (id: string) => {
    setEditingItem(editingItem === id ? null : id);
  };

  const toggleExpandCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const toggleExpandProducts = (name: string) => {
    setExpandedProducts(expandedProducts === name ? null : name);
  };

  const handleDeleteToolCategory = (id: string) => {
    setToolCats(toolCats.filter(category => category.id !== id));
    toast({
      title: "Category Deleted",
      description: "Tool category has been deleted successfully.",
      variant: "success",
    });
  };

  const handleDeleteManufacturerCategory = (id: string) => {
    setManufacturerCats(manufacturerCats.filter(manufacturer => manufacturer.id !== id));
    toast({
      title: "Manufacturer Deleted",
      description: "Manufacturer has been deleted successfully.",
      variant: "success",
    });
  };

  const handleDeleteFeaturedGroup = (id: string) => {
    setFeaturedCats(featuredCats.filter(group => group.id !== id));
    toast({
      title: "Featured Group Deleted",
      description: "Featured group has been deleted successfully.",
      variant: "success",
    });
  };

  const addToolCategory = () => {
    if (!newToolCategory.name) return;
    
    const subcategoriesArray = newToolCategory.subcategories
      ? newToolCategory.subcategories.split(',').map(item => item.trim())
      : [];
    
    const newCategory: ToolCategory = {
      id: `tool-${Date.now()}`,
      name: newToolCategory.name,
      slug: newToolCategory.name.toLowerCase().replace(/\s+/g, '-'),
      description: newToolCategory.description,
      subcategories: subcategoriesArray.length > 0 ? subcategoriesArray : undefined,
      productCount: 0
    };
    
    setToolCats([...toolCats, newCategory]);
    setNewToolCategory({ name: '', description: '', subcategories: '' });
    
    toast({
      title: "Category Added",
      description: `${newToolCategory.name} has been added successfully.`,
      variant: "success",
    });
  };

  const addManufacturerCategory = () => {
    if (!newManufacturerCategory.name) return;
    
    const newManufacturer: Manufacturer = {
      id: `manufacturer-${Date.now()}`,
      name: newManufacturerCategory.name,
      slug: newManufacturerCategory.name.toLowerCase().replace(/\s+/g, '-'),
      description: newManufacturerCategory.description,
      category: newManufacturerCategory.category as any,
    };
    
    setManufacturerCats([...manufacturerCats, newManufacturer]);
    setNewManufacturerCategory({ name: '', description: '', category: 'automotive' });
    
    toast({
      title: "Manufacturer Added",
      description: `${newManufacturerCategory.name} has been added successfully.`,
      variant: "success",
    });
  };

  const addFeaturedGroup = () => {
    if (!newFeaturedGroup.name) return;
    
    const newGroup: FeaturedGroup = {
      id: `featured-${Date.now()}`,
      name: newFeaturedGroup.name,
      description: newFeaturedGroup.description,
      slug: newFeaturedGroup.name.toLowerCase().replace(/\s+/g, '-'),
      toolIds: [],
      priority: featuredCats.length + 1,
      active: true
    };
    
    setFeaturedCats([...featuredCats, newGroup]);
    setNewFeaturedGroup({ name: '', description: '' });
    
    toast({
      title: "Featured Group Added",
      description: `${newFeaturedGroup.name} has been added successfully.`,
      variant: "success",
    });
  };

  const handleUpdateProduct = async (updatedProduct: any) => {
    await updateProduct(updatedProduct);
  };

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="tool-categories">Tool Categories</TabsTrigger>
          <TabsTrigger value="manufacturer-categories">Manufacturer Categories</TabsTrigger>
          <TabsTrigger value="featured-groups">Featured Groups</TabsTrigger>
        </TabsList>

        {/* Tool Categories Tab */}
        <TabsContent value="tool-categories">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-end gap-3 mb-6">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Category Name</label>
                  <Input 
                    placeholder="Enter category name" 
                    value={newToolCategory.name} 
                    onChange={(e) => setNewToolCategory({...newToolCategory, name: e.target.value})} 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input 
                    placeholder="Enter description" 
                    value={newToolCategory.description} 
                    onChange={(e) => setNewToolCategory({...newToolCategory, description: e.target.value})} 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Subcategories (comma separated)</label>
                  <Input 
                    placeholder="Enter subcategories" 
                    value={newToolCategory.subcategories} 
                    onChange={(e) => setNewToolCategory({...newToolCategory, subcategories: e.target.value})} 
                  />
                </div>
                <Button onClick={addToolCategory} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Product Count</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toolCats.map((category) => (
                      <React.Fragment key={category.id}>
                        <TableRow>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell>{category.productCount || 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => toggleEditItem(category.id)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => toggleExpandCategory(category.id)}>
                                {expandedCategory === category.id ? 
                                  <ChevronUp className="h-4 w-4 mr-1" /> : 
                                  <ChevronDown className="h-4 w-4 mr-1" />}
                                {expandedCategory === category.id ? "Hide" : "Expand"}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => toggleExpandProducts(category.name)}>
                                {expandedProducts === category.name ? "Hide Products" : "View Products"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                                onClick={() => handleDeleteToolCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {editingItem === category.id && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-slate-50 p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Category Name</label>
                                  <Input defaultValue={category.name} />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Description</label>
                                  <Input defaultValue={category.description} />
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium mb-1 block">Subcategories (comma separated)</label>
                                  <Input defaultValue={category.subcategories?.join(', ')} />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                  <Button className="mr-2">Save Changes</Button>
                                  <Button variant="outline" onClick={() => toggleEditItem(category.id)}>Cancel</Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {expandedCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-slate-50 p-0">
                              <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="subcategories">
                                  <AccordionTrigger className="px-4">
                                    Subcategories ({category.subcategories.length})
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="px-4 pb-4">
                                      <div className="grid grid-cols-3 gap-2">
                                        {category.subcategories.map((sub, index) => (
                                          <div key={index} className="bg-white p-2 rounded border flex justify-between items-center">
                                            <span>{sub}</span>
                                            <div className="flex gap-1">
                                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </TableCell>
                          </TableRow>
                        )}
                        {expandedProducts === category.name && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-slate-50 p-0">
                              <div className="p-4">
                                <ProductsList
                                  products={selectedCategoryProducts}
                                  categoryName={category.name}
                                  onProductUpdated={handleUpdateProduct}
                                />
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

        {/* Manufacturer Categories Tab */}
        <TabsContent value="manufacturer-categories">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-end gap-3 mb-6">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Manufacturer Name</label>
                  <Input 
                    placeholder="Enter manufacturer name" 
                    value={newManufacturerCategory.name} 
                    onChange={(e) => setNewManufacturerCategory({...newManufacturerCategory, name: e.target.value})} 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input 
                    placeholder="Enter description" 
                    value={newManufacturerCategory.description} 
                    onChange={(e) => setNewManufacturerCategory({...newManufacturerCategory, description: e.target.value})} 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newManufacturerCategory.category}
                    onChange={(e) => setNewManufacturerCategory({...newManufacturerCategory, category: e.target.value})}
                  >
                    <option value="automotive">Automotive</option>
                    <option value="heavy-duty">Heavy Duty</option>
                    <option value="equipment">Equipment</option>
                    <option value="marine">Marine</option>
                    <option value="atv-utv">ATV/UTV</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
                <Button onClick={addManufacturerCategory} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Manufacturer
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manufacturerCats.map((manufacturer) => (
                      <React.Fragment key={manufacturer.id}>
                        <TableRow>
                          <TableCell>{manufacturer.name}</TableCell>
                          <TableCell className="capitalize">{manufacturer.category}</TableCell>
                          <TableCell>{manufacturer.description || 'No description'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => toggleEditItem(manufacturer.id)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => toggleExpandProducts(`manufacturer-${manufacturer.name}`)}
                              >
                                {expandedProducts === `manufacturer-${manufacturer.name}` ? "Hide Products" : "View Products"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                                onClick={() => handleDeleteManufacturerCategory(manufacturer.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {editingItem === manufacturer.id && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-slate-50 p-4">
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Manufacturer Name</label>
                                  <Input defaultValue={manufacturer.name} />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Category</label>
                                  <select 
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    defaultValue={manufacturer.category}
                                  >
                                    <option value="automotive">Automotive</option>
                                    <option value="heavy-duty">Heavy Duty</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="marine">Marine</option>
                                    <option value="atv-utv">ATV/UTV</option>
                                    <option value="motorcycle">Motorcycle</option>
                                  </select>
                                </div>
                                <div className="col-span-3">
                                  <label className="text-sm font-medium mb-1 block">Description</label>
                                  <Textarea defaultValue={manufacturer.description} />
                                </div>
                                <div className="col-span-3 flex justify-end">
                                  <Button className="mr-2">Save Changes</Button>
                                  <Button variant="outline" onClick={() => toggleEditItem(manufacturer.id)}>Cancel</Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {expandedProducts === `manufacturer-${manufacturer.name}` && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-slate-50 p-0">
                              <div className="p-4">
                                <ProductsList
                                  products={generateManufacturerProducts(manufacturer.id)}
                                  categoryName={manufacturer.name}
                                  onProductUpdated={handleUpdateProduct}
                                />
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

        {/* Featured Groups Tab */}
        <TabsContent value="featured-groups">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-end gap-3 mb-6">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Group Name</label>
                  <Input 
                    placeholder="Enter group name" 
                    value={newFeaturedGroup.name}
                    onChange={(e) => setNewFeaturedGroup({...newFeaturedGroup, name: e.target.value})} 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input 
                    placeholder="Enter description" 
                    value={newFeaturedGroup.description}
                    onChange={(e) => setNewFeaturedGroup({...newFeaturedGroup, description: e.target.value})} 
                  />
                </div>
                <Button onClick={addFeaturedGroup} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Group
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featuredCats.map((group) => (
                      <React.Fragment key={group.id}>
                        <TableRow>
                          <TableCell>{group.name}</TableCell>
                          <TableCell>{group.description}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              group.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {group.active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => toggleEditItem(group.id)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => toggleExpandProducts(`featured-${group.id}`)}
                              >
                                {expandedProducts === `featured-${group.id}` ? "Hide Products" : "View Products"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                                onClick={() => handleDeleteFeaturedGroup(group.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {editingItem === group.id && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-slate-50 p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Group Name</label>
                                  <Input defaultValue={group.name} />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Status</label>
                                  <select 
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    defaultValue={group.active ? "active" : "inactive"}
                                  >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                  </select>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium mb-1 block">Description</label>
                                  <Textarea defaultValue={group.description} />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                                  <Input type="date" defaultValue={group.startDate} />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">End Date</label>
                                  <Input type="date" defaultValue={group.endDate} />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                  <Button className="mr-2">Save Changes</Button>
                                  <Button variant="outline" onClick={() => toggleEditItem(group.id)}>Cancel</Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {expandedProducts === `featured-${group.id}` && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-slate-50 p-0">
                              <div className="p-4">
                                <ProductsList
                                  products={[]} // We would need to fetch products by featured group
                                  categoryName={group.name}
                                  onProductUpdated={handleUpdateProduct}
                                />
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
      </Tabs>
    </div>
  );
};

export default CategoriesManagement;
