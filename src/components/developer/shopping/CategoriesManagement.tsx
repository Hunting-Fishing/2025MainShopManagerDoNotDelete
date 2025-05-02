
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search,
  Edit,
  Trash2, 
  LayoutGrid,
  TagIcon,
  ListFilter
} from "lucide-react";
import { categories } from "@/data/toolCategories";
import { manufacturers } from "@/data/manufacturers";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import ProductsList from './ProductsList';
import { AffiliateTool, AffiliateProduct } from "@/types/affiliate";

// Mock data for featured groups
const featuredGroups = [
  { id: '1', name: 'New Arrivals', description: 'Latest tools and equipment', toolCount: 12 },
  { id: '2', name: 'Summer Deals', description: 'Special offers for summer', toolCount: 8 },
  { id: '3', name: 'Essential Tools', description: 'Must-have tools for every mechanic', toolCount: 15 },
  { id: '4', name: 'Holiday Specials', description: 'Great gift ideas for mechanics', toolCount: 6 },
];

// Mock product data
const mockProducts: AffiliateTool[] = [
  {
    id: "t1",
    name: "Premium Socket Set",
    description: "Complete socket set with ratchet and extensions",
    slug: "premium-socket-set",
    price: 129.99,
    salePrice: 99.99,
    imageUrl: "https://example.com/images/socket-set.jpg",
    category: "Engine",
    manufacturer: "Craftsman",
    rating: 4.8,
    reviewCount: 152,
    featured: true,
    bestSeller: true,
    affiliateLink: "https://example.com/affiliate/socket-set"
  },
  {
    id: "t2",
    name: "Torque Wrench",
    description: "Precision torque wrench with digital display",
    slug: "torque-wrench",
    price: 89.99,
    imageUrl: "https://example.com/images/torque-wrench.jpg",
    category: "Engine",
    manufacturer: "Snap-on",
    rating: 4.6,
    reviewCount: 98,
    featured: false,
    bestSeller: false,
    affiliateLink: "https://example.com/affiliate/torque-wrench"
  },
  {
    id: "t3",
    name: "OBD-II Scanner",
    description: "Advanced diagnostic scanner for all vehicles",
    slug: "obd-ii-scanner",
    price: 149.99,
    salePrice: 129.99,
    imageUrl: "https://example.com/images/scanner.jpg",
    category: "Diagnostics",
    manufacturer: "Autel",
    rating: 4.9,
    reviewCount: 215,
    featured: true,
    bestSeller: true,
    affiliateLink: "https://example.com/affiliate/scanner"
  }
];

export default function CategoriesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('tool-categories');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<AffiliateTool[]>([]);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setExpandedCategory(null);
    setSelectedProducts([]);
  };

  const handleCategoryClick = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
      setSelectedProducts([]);
    } else {
      setExpandedCategory(categoryName);
      // Simulate loading products for this category
      setSelectedProducts(mockProducts.filter(p => p.category === categoryName));
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      toast({
        title: "Category Deleted",
        description: `${categoryName} has been deleted successfully.`,
      });
    }
  };

  const handleEditCategory = (categoryName: string) => {
    // In a real app, open an edit dialog
    console.log("Edit category:", categoryName);
    toast({
      title: "Edit Category",
      description: `Editing ${categoryName} - This would open an edit dialog in a complete implementation.`,
    });
  };

  const handleProductUpdate = async (updatedProduct: AffiliateTool | AffiliateProduct) => {
    // In a real app, this would update the database
    console.log("Updated product:", updatedProduct);
    
    // Update the local state to reflect the changes
    setSelectedProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct as AffiliateTool : p)
    );
    
    toast({
      title: "Product Updated",
      description: `${updatedProduct.name} has been updated successfully.`,
    });
  };

  const filteredToolCategories = Object.keys(categories).filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredManufacturerCategories = Object.keys(manufacturers).filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFeaturedGroups = featuredGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Categories Management</CardTitle>
        <CardDescription>
          Manage tool categories, manufacturer categories, and featured product groups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="tool-categories" className="flex items-center">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Tool Categories
            </TabsTrigger>
            <TabsTrigger value="manufacturer-categories" className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Manufacturer Categories
            </TabsTrigger>
            <TabsTrigger value="featured-groups" className="flex items-center">
              <TagIcon className="h-4 w-4 mr-2" />
              Featured Groups
            </TabsTrigger>
          </TabsList>

          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${currentTab === 'tool-categories' ? 'tool categories' : currentTab === 'manufacturer-categories' ? 'manufacturer categories' : 'featured groups'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" className="ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
            <Button variant="outline" className="ml-2">
              <ListFilter className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>
          
          {/* Tool Categories Tab */}
          <TabsContent value="tool-categories" className="border rounded-md p-4">
            <div className="space-y-4">
              {filteredToolCategories.length > 0 ? (
                filteredToolCategories.map((category) => (
                  <div key={category} className="border rounded-md overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 bg-muted/40 cursor-pointer"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="flex items-center">
                        {expandedCategory === category ? (
                          <ChevronDown className="h-5 w-5 mr-2 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground" />
                        )}
                        <div>
                          <h3 className="font-medium">{category}</h3>
                          <p className="text-sm text-muted-foreground">
                            {(categories as any)[category]?.length || 0} subcategories
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedCategory === category && (
                      <div className="p-4 bg-card border-t">
                        <Accordion type="single" collapsible className="mb-4">
                          <AccordionItem value="subcategories">
                            <AccordionTrigger>Subcategories</AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {(categories as any)[category]?.map((subcategory: string) => (
                                  <div key={subcategory} className="flex justify-between items-center border rounded-md p-2">
                                    <span>{subcategory}</span>
                                    <div className="flex space-x-1">
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        
                        <ProductsList 
                          products={selectedProducts}
                          categoryName={category}
                          onProductUpdated={handleProductUpdate}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No categories found matching your search.
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Manufacturer Categories Tab */}
          <TabsContent value="manufacturer-categories" className="border rounded-md p-4">
            <div className="space-y-4">
              {filteredManufacturerCategories.length > 0 ? (
                filteredManufacturerCategories.map((category) => (
                  <div key={category} className="border rounded-md overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 bg-muted/40 cursor-pointer"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="flex items-center">
                        {expandedCategory === category ? (
                          <ChevronDown className="h-5 w-5 mr-2 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground" />
                        )}
                        <div>
                          <h3 className="font-medium capitalize">{category}</h3>
                          <p className="text-sm text-muted-foreground">
                            {manufacturers[category as keyof typeof manufacturers]?.length || 0} manufacturers
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedCategory === category && (
                      <div className="p-4 bg-card border-t">
                        <Accordion type="single" collapsible className="mb-4">
                          <AccordionItem value="manufacturers">
                            <AccordionTrigger>Manufacturers</AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {manufacturers[category as keyof typeof manufacturers]?.map((manufacturer: any) => (
                                  <div key={manufacturer.id} className="flex justify-between items-center border rounded-md p-2">
                                    <span>{manufacturer.name}</span>
                                    <div className="flex space-x-1">
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        
                        <ProductsList 
                          products={selectedProducts}
                          categoryName={category}
                          onProductUpdated={handleProductUpdate}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No manufacturer categories found matching your search.
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Featured Groups Tab */}
          <TabsContent value="featured-groups" className="border rounded-md p-4">
            <div className="space-y-4">
              {filteredFeaturedGroups.length > 0 ? (
                filteredFeaturedGroups.map((group) => (
                  <div key={group.id} className="border rounded-md overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 bg-muted/40 cursor-pointer"
                      onClick={() => handleCategoryClick(group.name)}
                    >
                      <div className="flex items-center">
                        {expandedCategory === group.name ? (
                          <ChevronDown className="h-5 w-5 mr-2 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground" />
                        )}
                        <div>
                          <h3 className="font-medium">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.description} • {group.toolCount} tools
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(group.name);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(group.name);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedCategory === group.name && (
                      <div className="p-4 bg-card border-t">
                        <ProductsList 
                          products={selectedProducts}
                          categoryName={group.name}
                          onProductUpdated={handleProductUpdate}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No featured groups found matching your search.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
