
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProductsList from './ProductsList';
import { manufacturers } from '@/data/manufacturers';
import { toolCategories } from '@/data/toolCategories';
import { Manufacturer, ToolCategory } from '@/types/affiliate';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';
import { ArrowUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CategoriesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("tools");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { products, loading, error, updateProduct } = useProductsManager({
    categoryType: activeTab === 'tools' ? 'tool' : 'manufacturer',
    categoryName: selectedCategory || undefined
  });

  // Set default category when tab changes
  useEffect(() => {
    if (activeTab === 'tools' && toolCategories.length > 0) {
      setSelectedCategory(toolCategories[0].name);
    } else if (activeTab === 'manufacturers' && manufacturers.length > 0) {
      setSelectedCategory(manufacturers[0].name);
    } else {
      setSelectedCategory(null);
    }
  }, [activeTab]);

  const filteredToolCategories = toolCategories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredManufacturers = manufacturers.filter(manufacturer => 
    manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedToolCategories = [...filteredToolCategories].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  const sortedManufacturers = [...filteredManufacturers].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  const handleSortToggle = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const renderCategoryCard = (category: ToolCategory) => (
    <Card 
      key={category.id}
      className={`cursor-pointer transition-all ${selectedCategory === category.name ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
      onClick={() => setSelectedCategory(category.name)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-semibold">{category.name}</CardTitle>
        <CardDescription className="text-xs">
          {category.productCount || 0} products
        </CardDescription>
      </CardHeader>
      {category.imageUrl && (
        <CardContent className="pt-0">
          <div className="h-24 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            <img 
              src={category.imageUrl} 
              alt={category.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderManufacturerCard = (manufacturer: Manufacturer) => (
    <Card 
      key={manufacturer.id}
      className={`cursor-pointer transition-all ${selectedCategory === manufacturer.name ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
      onClick={() => setSelectedCategory(manufacturer.name)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-semibold">{manufacturer.name}</CardTitle>
        <CardDescription className="text-xs">
          {manufacturer.category}
        </CardDescription>
      </CardHeader>
      {manufacturer.logoUrl && (
        <CardContent className="pt-0">
          <div className="h-24 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden p-2">
            <img 
              src={manufacturer.logoUrl} 
              alt={manufacturer.name} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="tools">Tool Categories</TabsTrigger>
            <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === 'tools' ? 'categories' : 'manufacturers'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSortToggle}
              title={`Sort ${sortDirection === 'asc' ? 'A-Z' : 'Z-A'}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="tools" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedToolCategories.length > 0 ? (
              sortedToolCategories.map(renderCategoryCard)
            ) : (
              <div className="col-span-full p-4 text-center text-muted-foreground">
                No tool categories found
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="manufacturers" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedManufacturers.length > 0 ? (
              sortedManufacturers.map(renderManufacturerCard)
            ) : (
              <div className="col-span-full p-4 text-center text-muted-foreground">
                No manufacturers found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedCategory && (
        <div className="mt-8 p-4 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Products in {selectedCategory}</h2>
          {loading ? (
            <div className="p-8 text-center">Loading products...</div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              Error loading products: {error}
            </div>
          ) : (
            <ProductsList 
              products={products}
              categoryName={selectedCategory}
              onProductUpdated={updateProduct}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
