
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AffiliateTool, AffiliateProduct } from '@/types/affiliate';
import ProductsList from '@/components/developer/shopping/ProductsList';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';
import ProductForm from '@/components/developer/shopping/ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import TagSelector from '@/components/developer/shopping/TagSelector';
import { handleApiError } from '@/utils/errorHandling';
import { toast } from "@/hooks/use-toast";

export default function ProductsManagement() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct } = useProductsManager({ 
    categoryType: 'tool', 
    categoryName: 'all' 
  });
  
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<AffiliateTool | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{min: string, max: string}>({ min: '', max: '' });

  // Extract unique categories and manufacturers
  const categories = [...new Set(products.map(product => product.category))];
  const manufacturers = [...new Set(products.map(product => product.manufacturer))];
  
  // Handle adding a new product
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setIsEditMode(false);
    setIsProductDialogOpen(true);
  };
  
  // Handle editing a product
  const handleEditProduct = (product: AffiliateTool) => {
    setCurrentProduct(product);
    setIsEditMode(true);
    setIsProductDialogOpen(true);
  };
  
  // Handle product deletion
  const handleDeleteProduct = async (product: AffiliateTool) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await deleteProduct(product.id);
        toast({
          title: "Product deleted",
          description: `${product.name} has been deleted successfully.`,
          variant: "success",
        });
      } catch (error) {
        handleApiError(error, "Failed to delete product");
      }
    }
  };
  
  // Handle form submission for new or updated products
  const handleSubmitProduct = async (productData: Partial<AffiliateTool>) => {
    try {
      if (isEditMode && currentProduct) {
        await updateProduct({
          ...currentProduct,
          ...productData
        });
      } else {
        await createProduct(productData);
      }
      
      setIsProductDialogOpen(false);
    } catch (error) {
      handleApiError(error, "Failed to save product");
    }
  };

  // Export products feature
  const handleExportProducts = () => {
    try {
      const exportData = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        category: product.category,
        manufacturer: product.manufacturer,
        affiliateLink: product.affiliateLink,
        imageUrl: product.imageUrl,
        featured: product.featured,
        bestSeller: product.bestSeller,
      }));

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'products-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `${exportData.length} products exported successfully.`,
        variant: "success",
      });
    } catch (error) {
      handleApiError(error, "Failed to export products");
    }
  };
  
  // Import products feature
  const handleImportProducts = () => {
    // This would typically open a file dialog and parse the JSON
    toast({
      title: "Import feature",
      description: "Product import functionality will be implemented soon.",
      variant: "info",
    });
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategories = selectedCategories.length === 0 || 
                              selectedCategories.includes(product.category);
    
    const matchesManufacturers = selectedManufacturers.length === 0 || 
                                selectedManufacturers.includes(product.manufacturer);
    
    const matchesTags = selectedTags.length === 0 || 
                        (product.tags && selectedTags.every(tag => product.tags?.includes(tag)));
    
    const matchesPriceRange = (priceRange.min === '' || (product.price && product.price >= parseFloat(priceRange.min))) &&
                             (priceRange.max === '' || (product.price && product.price <= parseFloat(priceRange.max)));
    
    return matchesSearch && matchesCategories && matchesManufacturers && matchesTags && matchesPriceRange;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products by name, description, or manufacturer..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" /> Filters
            {(selectedCategories.length > 0 || selectedManufacturers.length > 0 || selectedTags.length > 0) && (
              <Badge variant="info" className="ml-1 text-xs">
                {selectedCategories.length + selectedManufacturers.length + selectedTags.length}
              </Badge>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleExportProducts}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleImportProducts}
          >
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleAddProduct}
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card className="bg-slate-50 border border-slate-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Categories filter */}
              <div>
                <Label className="mb-2 block">Categories</Label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {categories.map(category => (
                    <Badge 
                      key={category} 
                      variant={selectedCategories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedCategories.includes(category)) {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        } else {
                          setSelectedCategories([...selectedCategories, category]);
                        }
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Manufacturers filter */}
              <div>
                <Label className="mb-2 block">Manufacturers</Label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {manufacturers.map(manufacturer => (
                    <Badge 
                      key={manufacturer} 
                      variant={selectedManufacturers.includes(manufacturer) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedManufacturers.includes(manufacturer)) {
                          setSelectedManufacturers(selectedManufacturers.filter(m => m !== manufacturer));
                        } else {
                          setSelectedManufacturers([...selectedManufacturers, manufacturer]);
                        }
                      }}
                    >
                      {manufacturer}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Tags filter */}
              <div>
                <Label className="mb-2 block">Tags</Label>
                <TagSelector
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                  suggestedTags={[]}
                  placeholder="Filter by tags..."
                />
              </div>
              
              {/* Price range filter */}
              <div>
                <Label className="mb-2 block">Price Range</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={priceRange.min} 
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-24"
                  />
                  <span>to</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={priceRange.max} 
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="all">
        <TabsList className="border bg-white mb-4">
          <TabsTrigger value="all">All Products ({products.length})</TabsTrigger>
          <TabsTrigger value="featured">Featured ({products.filter(p => p.featured).length})</TabsTrigger>
          <TabsTrigger value="bestsellers">Best Sellers ({products.filter(p => p.bestSeller).length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ProductsList 
            products={filteredProducts}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </TabsContent>
        
        <TabsContent value="featured">
          <ProductsList 
            products={filteredProducts.filter(p => p.featured)}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </TabsContent>
        
        <TabsContent value="bestsellers">
          <ProductsList 
            products={filteredProducts.filter(p => p.bestSeller)}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={currentProduct || undefined}
            onSubmit={handleSubmitProduct}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
