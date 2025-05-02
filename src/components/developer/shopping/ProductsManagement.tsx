
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus, PenLine, Trash2, Image, Info } from 'lucide-react';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';
import { AffiliateTool } from '@/types/affiliate';
import ProductForm from './ProductForm';
import ProductsList from './ProductsList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

const ProductsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all-products");
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [manufacturers, setManufacturers] = useState<{id: string, name: string}[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AffiliateTool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { products, loading, error, updateProduct, createProduct, deleteProduct } = useProductsManager({ 
    categoryType: 'tool', 
    categoryName: activeTab === 'all-products' ? undefined : activeTab
  });

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
        toast({
          title: "Error",
          description: "Failed to load product categories",
          variant: "destructive"
        });
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
        toast({
          title: "Error",
          description: "Failed to load manufacturers",
          variant: "destructive"
        });
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
        toast({
          title: "Success",
          description: "Product deleted successfully",
          variant: "success"
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmitProduct = async (productData: Partial<AffiliateTool>) => {
    setIsLoading(true);
    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...productData });
      } else {
        await createProduct(productData);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate unique tab IDs from product categories
  const categoryTabs = Array.from(new Set(products.map(p => p.category)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>
      
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-red-600 mt-0.5" />
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="overflow-x-auto flex w-full py-1">
          <TabsTrigger value="all-products">All Products</TabsTrigger>
          {categoryTabs.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all-products">
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsList 
                products={products} 
                loading={loading}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {categoryTabs.map((category) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle>{category} Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsList 
                  products={products.filter(p => p.category === category)}
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
