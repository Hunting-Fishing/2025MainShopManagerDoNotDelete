
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  PlusCircle, 
  MoreHorizontal, 
  ArrowUpDown,
  Tag,
  Building,
  Factory,
  Sparkles,
  TrendingUp,
  Settings,
  Wrench,
  Car,
  Truck
} from "lucide-react";
import { ManufacturerCategory, ToolCategory } from '@/types/affiliate';
import { categories } from '@/data/toolCategories';
import { manufacturers } from '@/data/manufacturers';

// Load subcategories from data
const toolCategoriesData: ToolCategory[] = Object.keys(categories).map((key, index) => ({
  id: `tc-${index + 1}`,
  name: key,
  slug: key.toLowerCase().replace(/\s+/g, '-'),
  description: `Professional-grade ${key.toLowerCase()} tools for automotive repair and maintenance.`,
  subcategories: categories[key as keyof typeof categories],
  imageUrl: `https://via.placeholder.com/150?text=${key}`,
  featured: index < 3,
  productCount: Math.floor(Math.random() * 100) + 20
}));

// Group manufacturers by category
const manufacturersByCategory: Record<string, number> = {};
manufacturers.forEach(manufacturer => {
  if (!manufacturersByCategory[manufacturer.category]) {
    manufacturersByCategory[manufacturer.category] = 0;
  }
  manufacturersByCategory[manufacturer.category]++;
});

const featuredGroupsData = [
  {
    id: "fg-1",
    name: "Featured Tools",
    description: "Top tools featured across the site",
    slug: "featured-tools",
    toolIds: ["t1", "t2", "t3", "t4"],
    priority: 1,
    active: true,
    startDate: "2024-03-01",
    endDate: "2024-12-31"
  },
  {
    id: "fg-2",
    name: "Best Selling Tools",
    description: "Most popular tools based on sales",
    slug: "best-selling-tools",
    toolIds: ["t5", "t6", "t7", "t8"],
    priority: 2,
    active: true,
  },
  {
    id: "fg-3",
    name: "New Arrivals",
    description: "Latest tools added to the catalog",
    slug: "new-arrivals",
    toolIds: ["t9", "t10", "t11"],
    priority: 3,
    active: false,
    startDate: "2024-05-01",
    endDate: "2024-07-31"
  }
];

export default function CategoriesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState("tool-categories");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Filter based on search
  const filteredToolCategories = toolCategoriesData.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFeaturedGroups = featuredGroupsData.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Sort data based on current sort settings
  const getSortedData = (data: any[]) => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      } else if (typeof valueA === "boolean" && typeof valueB === "boolean") {
        return sortDirection === "asc" ? (valueA ? 1 : -1) : (valueA ? -1 : 1);
      }
      return 0;
    });
  };

  const sortedToolCategories = getSortedData(filteredToolCategories);
  const sortedFeaturedGroups = getSortedData(filteredFeaturedGroups);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories & Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="tool-categories" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span>Tool Categories</span>
              </TabsTrigger>
              <TabsTrigger value="manufacturer-categories" className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                <span>Manufacturer Categories</span>
              </TabsTrigger>
              <TabsTrigger value="featured-groups" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Featured Groups</span>
              </TabsTrigger>
            </TabsList>

            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === 'tool-categories' ? 'tool categories' : activeTab === 'manufacturer-categories' ? 'manufacturer categories' : 'featured groups'}...`}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Tool Categories Tab */}
            <TabsContent value="tool-categories" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button variant="default">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                </Button>
              </div>
              
              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("name")}
                        >
                          Name
                          {sortColumn === "name" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Subcategories</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("productCount")}
                        >
                          Products
                          {sortColumn === "productCount" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("featured")}
                        >
                          Featured
                          {sortColumn === "featured" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedToolCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{category.description}</TableCell>
                        <TableCell>{category.subcategories?.length || 0}</TableCell>
                        <TableCell>{category.productCount}</TableCell>
                        <TableCell>
                          {category.featured ? (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Featured</Badge>
                          ) : (
                            ""
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedCategory(category);
                                setEditMode(true);
                              }}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Subcategories</DropdownMenuItem>
                              <DropdownMenuItem>View Products</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sortedToolCategories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No categories found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Manufacturer Categories Tab */}
            <TabsContent value="manufacturer-categories" className="space-y-4">
              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Manufacturers Count</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(manufacturersByCategory).map(([category, count]) => (
                      <TableRow key={category}>
                        <TableCell className="font-medium">
                          {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </TableCell>
                        <TableCell>{category}</TableCell>
                        <TableCell>{category}</TableCell>
                        <TableCell>{count}</TableCell>
                        <TableCell>
                          {category === 'automotive' && <Car className="h-4 w-4" />}
                          {category === 'heavy-duty' && <Truck className="h-4 w-4" />}
                          {category === 'equipment' && <Wrench className="h-4 w-4" />}
                          {category === 'marine' && <Search className="h-4 w-4" />}
                          {category === 'atv-utv' && <Car className="h-4 w-4" />}
                          {category === 'motorcycle' && <Settings className="h-4 w-4" />}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>View Manufacturers</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Featured Groups Tab */}
            <TabsContent value="featured-groups" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button variant="default">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Featured Group
                </Button>
              </div>
              
              <div className="overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("name")}
                        >
                          Group Name
                          {sortColumn === "name" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("priority")}
                        >
                          Priority
                          {sortColumn === "priority" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("active")}
                        >
                          Status
                          {sortColumn === "active" && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Item Count</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedFeaturedGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          {group.name === "Featured Tools" && <Sparkles className="inline mr-1.5 h-4 w-4 text-amber-500" />}
                          {group.name === "Best Selling Tools" && <TrendingUp className="inline mr-1.5 h-4 w-4 text-green-500" />}
                          {group.name === "New Arrivals" && <PlusCircle className="inline mr-1.5 h-4 w-4 text-blue-500" />}
                          {group.name}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{group.description}</TableCell>
                        <TableCell>{group.priority}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch checked={group.active} />
                            <span>{group.active ? "Active" : "Inactive"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{group.toolIds.length}</TableCell>
                        <TableCell>
                          {group.startDate && group.endDate 
                            ? `${new Date(group.startDate).toLocaleDateString()} - ${new Date(group.endDate).toLocaleDateString()}` 
                            : "No date limit"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Manage Items</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Edit Dialog - Could be extracted to a separate component */}
      {selectedCategory && editMode && (
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Edit Category: {selectedCategory.name}</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedCategory(null);
                setEditMode(false);
              }}
            >
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={selectedCategory.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={selectedCategory.slug} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={selectedCategory.description} />
            </div>

            <div className="space-y-2">
              <Label>Subcategories</Label>
              <div className="border rounded-md p-2">
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.subcategories?.map((subcat, idx) => (
                    <Badge key={idx} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                      {subcat}
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">×</Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Add subcategory" className="flex-1" />
                  <Button>Add</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productCount">Product Count</Label>
                <Input id="productCount" type="number" value={selectedCategory.productCount} />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="featured" checked={selectedCategory.featured} />
                <Label htmlFor="featured">Featured Category</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
