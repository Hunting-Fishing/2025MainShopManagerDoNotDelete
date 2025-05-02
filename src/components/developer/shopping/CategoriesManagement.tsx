
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash,
  Plus,
  Search,
  MoveUp,
  MoveDown,
  ExternalLink,
  Tag,
  ChevronDown,
  ChevronUp,
  ListFilter,
  Hammer,
  ShoppingBag,
  Star,
  BuildingStore,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  subcategories?: string[];
  productCount?: number;
}

interface ManufacturerCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  companyCount: number;
}

interface FeaturedGroup {
  id: string;
  name: string;
  description: string;
  priority: number;
  active: boolean;
  toolCount: number;
}

const CategoriesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("product-categories");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use React Query to fetch product categories
  const { data: productCategories = [], isLoading: isLoadingProducts, error: productError } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      // In a real implementation, this would fetch from your database
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample data for testing
      return [
        {
          id: "1",
          name: "Engine",
          description: "Tools for engine repair and maintenance",
          slug: "engine",
          subcategories: ["Valve Tools", "Compression Testers", "Timing Tools"],
          productCount: 42
        },
        {
          id: "2",
          name: "Brakes",
          description: "Brake service and repair tools",
          slug: "brakes",
          subcategories: ["Calipers", "Brake Line Tools", "Bleeders"],
          productCount: 28
        },
        {
          id: "3",
          name: "Electrical",
          description: "Electrical system diagnostic and repair tools",
          slug: "electrical",
          subcategories: ["Multimeters", "Circuit Testers", "Terminal Tools"],
          productCount: 36
        }
      ];
    },
  });
  
  // Use React Query to fetch manufacturer categories
  const { data: manufacturerCategories = [], isLoading: isLoadingManufacturers, error: manufacturerError } = useQuery({
    queryKey: ['manufacturerCategories'],
    queryFn: async () => {
      // In a real implementation, this would fetch from your database
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Sample data for testing
      return [
        {
          id: "1",
          name: "Automotive",
          slug: "automotive",
          description: "Car and light truck manufacturers",
          companyCount: 18
        },
        {
          id: "2",
          name: "Heavy-Duty",
          slug: "heavy-duty",
          description: "Commercial and industrial vehicle manufacturers",
          companyCount: 12
        },
        {
          id: "3",
          name: "Equipment",
          slug: "equipment",
          description: "Tool and equipment manufacturers",
          companyCount: 24
        }
      ];
    },
  });
  
  // Use React Query to fetch featured groups
  const { data: featuredGroups = [], isLoading: isLoadingFeatured, error: featuredError } = useQuery({
    queryKey: ['featuredGroups'],
    queryFn: async () => {
      // In a real implementation, this would fetch from your database
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Sample data for testing
      return [
        {
          id: "1",
          name: "Summer Specials",
          description: "Featured tools for summer maintenance",
          priority: 1,
          active: true,
          toolCount: 8
        },
        {
          id: "2",
          name: "New Arrivals",
          description: "Latest tools added to the catalog",
          priority: 2,
          active: true,
          toolCount: 12
        },
        {
          id: "3",
          name: "Best Sellers",
          description: "Most popular tools by sales volume",
          priority: 3,
          active: true,
          toolCount: 15
        },
        {
          id: "4",
          name: "Holiday Bundle",
          description: "Special holiday tool bundles",
          priority: 4,
          active: false,
          toolCount: 6
        }
      ];
    },
  });

  // Filter categories based on search and active tab
  const filteredProductCategories = React.useMemo(() => {
    return productCategories.filter((category: Category) => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productCategories, searchTerm]);
  
  const filteredManufacturerCategories = React.useMemo(() => {
    return manufacturerCategories.filter((category: ManufacturerCategory) => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [manufacturerCategories, searchTerm]);
  
  const filteredFeaturedGroups = React.useMemo(() => {
    return featuredGroups.filter((group: FeaturedGroup) => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [featuredGroups, searchTerm]);
  
  // Action handlers
  const handleAddCategory = (type: string) => {
    console.log(`Add ${type} category clicked`);
  };
  
  const handleEditCategory = (type: string, id: string) => {
    console.log(`Edit ${type} category ${id}`);
  };
  
  const handleDeleteCategory = (type: string, id: string) => {
    console.log(`Delete ${type} category ${id}`);
  };
  
  const handleMoveUp = (type: string, id: string) => {
    console.log(`Move up ${type} ${id}`);
  };
  
  const handleMoveDown = (type: string, id: string) => {
    console.log(`Move down ${type} ${id}`);
  };
  
  const handleToggleActive = (id: string, currentState: boolean) => {
    console.log(`Toggle featured group ${id} from ${currentState} to ${!currentState}`);
  };
  
  const handleViewItems = (type: string, id: string) => {
    console.log(`View items in ${type} ${id}`);
  };
  
  const renderError = (type: string, error: any) => {
    return (
      <Card className="bg-white shadow-md rounded-lg mb-6">
        <CardHeader>
          <CardTitle>{type} Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-red-500">Error loading {type.toLowerCase()}. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderLoading = (type: string) => {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-muted-foreground">Loading {type.toLowerCase()}...</p>
      </div>
    );
  };
  
  const renderEmptyState = (type: string, handleAdd: () => void) => {
    const getIcon = () => {
      switch (type) {
        case "Product Categories": return <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />;
        case "Manufacturer Categories": return <BuildingStore className="h-12 w-12 text-slate-400 mx-auto mb-4" />;
        case "Featured Groups": return <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />;
        default: return <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />;
      }
    };
    
    return (
      <div className="text-center py-8">
        {getIcon()}
        <p className="text-muted-foreground mb-4">No {type.toLowerCase()} found.</p>
        <Button 
          variant="outline" 
          onClick={handleAdd}
        >
          Add your first {type.toLowerCase().slice(0, -1)}
        </Button>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md rounded-lg mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Category Management</CardTitle>
            <CardDescription>
              Manage product categories, manufacturer types, and featured groups
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleAddCategory(activeTab === "product-categories" ? "product" : 
                  activeTab === "manufacturer-categories" ? "manufacturer" : "featured")}
              >
                <Plus size={16} />
                <span>Add {activeTab === "product-categories" ? "Category" : 
                  activeTab === "manufacturer-categories" ? "Manufacturer Type" : "Featured Group"}</span>
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="product-categories" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Product Categories</span>
              </TabsTrigger>
              <TabsTrigger value="manufacturer-categories" className="flex items-center gap-2">
                <BuildingStore className="h-4 w-4" />
                <span>Manufacturer Types</span>
              </TabsTrigger>
              <TabsTrigger value="featured-groups" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Featured Groups</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="product-categories" className="space-y-4">
              {productError ? renderError("Product Categories", productError) : 
                isLoadingProducts ? renderLoading("product categories") :
                filteredProductCategories.length === 0 ? renderEmptyState("Product Categories", () => handleAddCategory("product")) : (
                  filteredProductCategories.map((category: Category) => (
                    <div 
                      key={category.id}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{category.name}</h3>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {category.productCount || 0} products
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                          
                          {category.subcategories && category.subcategories.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {category.subcategories.map((subcat, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {subcat}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleMoveUp("product", category.id)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <MoveUp className="h-4 w-4" />
                            <span className="sr-only">Move up</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleMoveDown("product", category.id)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <MoveDown className="h-4 w-4" />
                            <span className="sr-only">Move down</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewItems("product", category.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View products</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditCategory("product", category.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteCategory("product", category.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
            </TabsContent>
            
            <TabsContent value="manufacturer-categories" className="space-y-4">
              {manufacturerError ? renderError("Manufacturer Categories", manufacturerError) : 
                isLoadingManufacturers ? renderLoading("manufacturer categories") :
                filteredManufacturerCategories.length === 0 ? renderEmptyState("Manufacturer Categories", () => handleAddCategory("manufacturer")) : (
                  filteredManufacturerCategories.map((category: ManufacturerCategory) => (
                    <div 
                      key={category.id}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{category.name}</h3>
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {category.companyCount} manufacturers
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleMoveUp("manufacturer", category.id)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <MoveUp className="h-4 w-4" />
                            <span className="sr-only">Move up</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleMoveDown("manufacturer", category.id)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <MoveDown className="h-4 w-4" />
                            <span className="sr-only">Move down</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewItems("manufacturer", category.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View manufacturers</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditCategory("manufacturer", category.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteCategory("manufacturer", category.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
            </TabsContent>
            
            <TabsContent value="featured-groups" className="space-y-4">
              {featuredError ? renderError("Featured Groups", featuredError) : 
                isLoadingFeatured ? renderLoading("featured groups") :
                filteredFeaturedGroups.length === 0 ? renderEmptyState("Featured Groups", () => handleAddCategory("featured")) : (
                  filteredFeaturedGroups.map((group: FeaturedGroup) => (
                    <div 
                      key={group.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${group.active ? 'bg-white' : 'bg-slate-50'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{group.name}</h3>
                            <Badge variant={group.active ? "success" : "secondary"} className="text-xs">
                              {group.active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              {group.toolCount} tools
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">{group.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Priority: {group.priority}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant={group.active ? "ghost" : "outline"} 
                            size="sm" 
                            onClick={() => handleToggleActive(group.id, group.active)}
                            className={group.active ? "text-green-600" : "text-slate-500"}
                          >
                            {group.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleMoveUp("featured", group.id)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <MoveUp className="h-4 w-4" />
                            <span className="sr-only">Increase priority</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleMoveDown("featured", group.id)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <MoveDown className="h-4 w-4" />
                            <span className="sr-only">Decrease priority</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewItems("featured", group.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View tools</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditCategory("featured", group.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteCategory("featured", group.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesManagement;
