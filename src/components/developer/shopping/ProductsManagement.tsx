
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus, PenLine, Trash2, Import, Export, Filter, Search, SortDesc } from 'lucide-react';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';
import { AffiliateTool } from '@/types/affiliate';
import ProductForm from './ProductForm';
import ProductsList from './ProductsList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

const ProductsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all-products");
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [manufacturers, setManufacturers] = useState<{id: string, name: string}[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AffiliateTool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [filterManufacturer, setFilterManufacturer] = useState<string>('');
  
  const { products, loading, error, updateProduct, createProduct, deleteProduct } = useProductsManager({ 
    categoryType: 'tool', 
    categoryName: activeTab === 'all-products' ? undefined : activeTab
  });

  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      // Filter by search query
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by manufacturer if selected
      const matchesManufacturer = !filterManufacturer || 
        product.manufacturer === filterManufacturer;
      
      return matchesSearch && matchesManufacturer;
    }).sort((a, b) => {
      // Sort products
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === 'recent') {
        // Assuming there's a createdAt field, or fall back to comparing ids
        return (b.id || '').localeCompare(a.id || '');
      }
      return 0;
    });
  }, [products, searchQuery, filterManufacturer, sortBy]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('product_categories')
          .select('id, name');
        
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error("Failed to load product categories");
      }
    };

    // Fetch manufacturers
    const fetchManufacturers = async () => {
      try {
        const { data, error } = await supabase
          .from('manufacturers')
          .select('id, name');
        
        if (error) throw error;
        setManufacturers(data || []);
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
        toast.error("Failed to load manufacturers");
      }
    };

    fetchCategories();
    fetchManufacturers();
  }, []);

  const handleEditProduct = (product: AffiliateTool) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (product: AffiliateTool) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleSubmitProduct = async (productData: Partial<AffiliateTool>) => {
    setIsLoading(true);
    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...productData });
        toast.success("Product updated successfully");
      } else {
        await createProduct(productData);
        toast.success("Product created successfully");
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    // Simple CSV export of product data
    try {
      const headers = "Name,Price,Sale Price,Category,Manufacturer,Seller,Description,URL\n";
      const csvContent = filteredProducts.map(p => 
        `"${p.name}",${p.price || ''},${p.salePrice || ''},"${p.category || ''}","${p.manufacturer || ''}","${p.seller || ''}","${(p.description || '').replace(/"/g, '""')}","${p.affiliateLink || ''}"`
      ).join('\n');
      
      const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `products-export-${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Products exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export products");
    }
  };

  // Generate unique tab IDs from product categories
  const categoryTabs = Array.from(new Set(products.map(p => p.category)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button variant="outline" onClick={handleExportCsv}>
            <Export className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Search className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Error loading products</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct || undefined}
            onSubmit={handleSubmitProduct}
            onCancel={() => setIsFormOpen(false)}
            categories={categories}
            manufacturers={manufacturers}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
      
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterManufacturer} onValueChange={setFilterManufacturer}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Manufacturers" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Manufacturers</SelectItem>
                {manufacturers.map(m => (
                  <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <div className="flex items-center">
                  <SortDesc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price">Price (Low-High)</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-4">
          {searchQuery || filterManufacturer ? (
            <div className="flex items-center text-sm text-gray-500">
              <span>Showing {filteredProducts.length} of {products.length} products</span>
              {searchQuery && (
                <Badge variant="outline" className="ml-2 bg-blue-50 border-blue-200">
                  Search: {searchQuery}
                  <button 
                    className="ml-1 hover:text-red-500" 
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterManufacturer && (
                <Badge variant="outline" className="ml-2 bg-purple-50 border-purple-200">
                  Manufacturer: {filterManufacturer}
                  <button 
                    className="ml-1 hover:text-red-500" 
                    onClick={() => setFilterManufacturer('')}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          ) : null}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="overflow-x-auto flex w-full py-1 bg-white rounded-full shadow-sm border">
          <TabsTrigger value="all-products" className="rounded-full">All Products</TabsTrigger>
          {categoryTabs.map((category) => (
            <TabsTrigger key={category} value={category} className="rounded-full">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all-products">
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {filteredProducts.length} products in total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsList 
                products={filteredProducts} 
                loading={loading}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {categoryTabs.map((category) => (
          <TabsContent key={category} value={category}>
            <Card className="bg-white shadow-md rounded-xl border border-gray-100">
              <CardHeader>
                <CardTitle>{category} Products</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {filteredProducts.length} products in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductsList 
                  products={filteredProducts}
                  loading={loading}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ProductsManagement;
