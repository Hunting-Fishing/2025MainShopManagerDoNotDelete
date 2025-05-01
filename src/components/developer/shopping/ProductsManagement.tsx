
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractAmazonProductId } from '@/utils/amazonUtils';

// Define types based on the actual database schema
interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  affiliate_link: string;
  category_id: string;
  price: number;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    image_url: '',
    affiliate_link: '',
    category_id: '',
    price: 0,
    is_featured: false,
    is_approved: false
  });

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch products data from Supabase
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch products with categories
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories:category_id (
            name,
            id
          )
        `);

      if (error) throw error;

      // Map products data to include category name
      const productsWithCategories = productsData.map(product => ({
        ...product,
        category_name: product.product_categories?.name || 'Unknown Category'
      }));

      setProducts(productsWithCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('id, name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  // Open dialog for creating or editing a product
  const openProductDialog = (product?: Product) => {
    if (product) {
      // Editing existing product
      setEditingProduct(product);
      setFormData({
        id: product.id,
        title: product.title || '',
        description: product.description || '',
        image_url: product.image_url || '',
        affiliate_link: product.affiliate_link || '',
        category_id: product.category_id || '',
        price: product.price || 0,
        is_featured: product.is_featured || false,
        is_approved: product.is_approved || false
      });
    } else {
      // Creating new product
      setEditingProduct(null);
      setFormData({
        id: '',
        title: '',
        description: '',
        image_url: '',
        affiliate_link: '',
        category_id: '',
        price: 0,
        is_featured: false,
        is_approved: false
      });
    }
    setIsDialogOpen(true);
  };

  // Handle product form submission
  const handleProductSubmit = async () => {
    try {
      const amazonId = extractAmazonProductId(formData.affiliate_link);
      
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            affiliate_link: formData.affiliate_link,
            category_id: formData.category_id,
            price: formData.price,
            is_featured: formData.is_featured,
            is_approved: formData.is_approved
          })
          .eq('id', formData.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            affiliate_link: formData.affiliate_link,
            category_id: formData.category_id,
            price: formData.price,
            is_featured: formData.is_featured,
            is_approved: formData.is_approved
          });

        if (error) throw error;
        toast.success('Product created successfully');
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products Management</h2>
          <p className="text-muted-foreground">Manage affiliate products in your store</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchProducts()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => openProductDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No products found. Add a product to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.title}
                              className="h-10 w-10 object-cover rounded-md"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-slate-200 rounded-md flex items-center justify-center text-xs text-slate-500">
                              No Image
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{product.title}</TableCell>
                        <TableCell>{product.category_name}</TableCell>
                        <TableCell>${product.price?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>
                          <div className={`h-2 w-2 rounded-full ${product.is_featured ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                        </TableCell>
                        <TableCell>
                          <div className={`h-2 w-2 rounded-full ${product.is_approved ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => openProductDialog(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="affiliate_link">Affiliate Link (Amazon)</Label>
              <Input
                id="affiliate_link"
                name="affiliate_link"
                value={formData.affiliate_link}
                onChange={handleInputChange}
                placeholder="https://www.amazon.com/..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category_id">Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleSelectChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price.toString()}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Featured Product</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_approved"
                checked={formData.is_approved}
                onCheckedChange={(checked) => handleSwitchChange('is_approved', checked)}
              />
              <Label htmlFor="is_approved">Approved</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProductSubmit}>
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
