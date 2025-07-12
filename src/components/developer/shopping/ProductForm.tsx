import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { createProductAdmin, updateProductAdmin, ProductFormData } from '@/services/admin/productAdminService';
import { fetchProductById, fetchProductCategories, ProductCategory } from '@/services/products/productService';

interface ProductFormProps {
  mode: 'create' | 'edit';
}

export default function ProductForm({ mode }: ProductFormProps) {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    image_url: '',
    affiliate_link: '',
    category_id: '',
    is_featured: false,
    is_bestseller: false,
    is_approved: true,
    stock_quantity: 0,
    sku: '',
    product_type: 'affiliate'
  });

  useEffect(() => {
    fetchCategories();
    if (mode === 'edit' && productId) {
      fetchProduct();
    }
  }, [mode, productId]);

  const fetchCategories = async () => {
    try {
      const data = await fetchProductCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchProduct = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const product = await fetchProductById(productId);
      if (product) {
        setFormData({
          title: product.title,
          description: product.description || '',
          price: product.price || 0,
          image_url: product.image_url || '',
          affiliate_link: product.affiliate_link || '',
          category_id: product.category_id,
          is_featured: product.is_featured || false,
          is_bestseller: product.is_bestseller || false,
          is_approved: product.is_approved || true,
          stock_quantity: product.stock_quantity || 0,
          sku: product.sku || '',
          product_type: (product.product_type as 'affiliate' | 'suggested') || 'affiliate'
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Product title is required');
      return;
    }

    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        const result = await createProductAdmin(formData);
        if (result) {
          toast.success('Product created successfully');
          navigate('/developer/shopping-controls');
        } else {
          toast.error('Failed to create product');
        }
      } else if (mode === 'edit' && productId) {
        const result = await updateProductAdmin(productId, formData);
        if (result) {
          toast.success('Product updated successfully');
          navigate('/developer/shopping-controls');
        } else {
          toast.error('Failed to update product');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate('/developer/shopping-controls')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Add New Product' : 'Edit Product'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'create' ? 'Create a new affiliate product' : 'Update product information'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter product title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Product SKU"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Links and Media */}
          <Card>
            <CardHeader>
              <CardTitle>Links and Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliate_link">Affiliate Link</Label>
                <Input
                  id="affiliate_link"
                  value={formData.affiliate_link}
                  onChange={(e) => handleInputChange('affiliate_link', e.target.value)}
                  placeholder="https://affiliate-link.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type</Label>
                <Select value={formData.product_type} onValueChange={(value) => handleInputChange('product_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="affiliate">Affiliate Product</SelectItem>
                    <SelectItem value="suggested">Suggested Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Product Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured">Featured Product</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_bestseller"
                  checked={formData.is_bestseller}
                  onCheckedChange={(checked) => handleInputChange('is_bestseller', checked)}
                />
                <Label htmlFor="is_bestseller">Bestseller</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_approved"
                  checked={formData.is_approved}
                  onCheckedChange={(checked) => handleInputChange('is_approved', checked)}
                />
                <Label htmlFor="is_approved">Approved</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/developer/shopping-controls')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {mode === 'create' ? 'Create Product' : 'Update Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}