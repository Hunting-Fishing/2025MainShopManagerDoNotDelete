
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { isValidAmazonLink, extractAmazonASIN } from '@/utils/amazonUtils';
import { Card } from '@/components/ui/card';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  affiliate_link: string | null;
  category_id: string | null;
  manufacturer_id: string | null;
  is_featured: boolean;
  is_bestseller: boolean;
  is_approved: boolean;
  created_at: string;
  category_name?: string;
  manufacturer_name?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Manufacturer {
  id: string;
  name: string;
  category: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Form state
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: 0,
    image_url: '',
    affiliate_link: '',
    category_id: '',
    manufacturer_id: '',
    is_featured: false,
    is_bestseller: false,
    is_approved: true
  });
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchManufacturers();
  }, []);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(name),
          manufacturers(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedProducts = data.map(product => ({
          ...product,
          category_name: product.product_categories?.name,
          manufacturer_name: product.manufacturers?.name
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const fetchManufacturers = async () => {
    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data) setManufacturers(data);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
    }
  };
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      description: '',
      price: 0,
      image_url: '',
      affiliate_link: '',
      category_id: '',
      manufacturer_id: '',
      is_featured: false,
      is_bestseller: false,
      is_approved: true
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description || '',
      price: product.price || 0,
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      category_id: product.category_id || '',
      manufacturer_id: product.manufacturer_id || '',
      is_featured: product.is_featured || false,
      is_bestseller: product.is_bestseller || false,
      is_approved: product.is_approved || false,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };
  
  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchProducts();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };
  
  const validateForm = (): boolean => {
    let errors: {[key: string]: string} = {};
    let isValid = true;
    
    if (!productForm.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }
    
    if (productForm.affiliate_link && !isValidAmazonLink(productForm.affiliate_link)) {
      errors.affiliate_link = 'Please enter a valid Amazon product link';
      isValid = false;
    }
    
    // Convert string price to number for validation
    if (isNaN(Number(productForm.price))) {
      errors.price = 'Price must be a valid number';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Convert price to a number
    const numericPrice = Number(productForm.price);
    
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            ...productForm,
            price: numericPrice
          })
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...productForm,
            price: numericPrice
          });
        
        if (error) throw error;
      }
      
      fetchProducts();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setProductForm(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProductForm(prev => ({ ...prev, [name]: value }));
  };
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No products found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>{product.category_name || 'Uncategorized'}</TableCell>
                <TableCell>{product.price ? `$${product.price.toFixed(2)}` : 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.is_approved ? (
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">Approved</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">Pending</Badge>
                    )}
                    {product.is_featured && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300">Featured</Badge>
                    )}
                    {product.is_bestseller && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">Bestseller</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                      <Pencil size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title" className="mb-2 block">
                  Product Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={productForm.title}
                  onChange={handleInputChange}
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="mb-2 block">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={productForm.price}
                  onChange={handleInputChange}
                  className={formErrors.price ? 'border-red-500' : ''}
                  step="0.01"
                />
                {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
              </div>

              <div>
                <Label htmlFor="image_url" className="mb-2 block">
                  Image URL
                </Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={productForm.image_url}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category_id" className="mb-2 block">
                  Category
                </Label>
                <Select 
                  value={productForm.category_id}
                  onValueChange={(value) => handleSelectChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="manufacturer_id" className="mb-2 block">
                  Manufacturer
                </Label>
                <Select 
                  value={productForm.manufacturer_id}
                  onValueChange={(value) => handleSelectChange('manufacturer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer.id} value={manufacturer.id}>{manufacturer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="affiliate_link" className="mb-2 block">
                Amazon Affiliate Link
              </Label>
              <Input
                id="affiliate_link"
                name="affiliate_link"
                value={productForm.affiliate_link}
                onChange={handleInputChange}
                className={formErrors.affiliate_link ? 'border-red-500' : ''}
              />
              {formErrors.affiliate_link && <p className="text-red-500 text-xs mt-1">{formErrors.affiliate_link}</p>}
              {productForm.affiliate_link && isValidAmazonLink(productForm.affiliate_link) && (
                <p className="text-green-600 text-xs mt-1">
                  Valid Amazon link. ASIN: {extractAmazonASIN(productForm.affiliate_link)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_approved"
                  checked={productForm.is_approved}
                  onCheckedChange={(checked) => handleSwitchChange('is_approved', checked)}
                />
                <Label htmlFor="is_approved" className="cursor-pointer">Approved</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={productForm.is_featured}
                  onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured" className="cursor-pointer">Featured</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_bestseller"
                  checked={productForm.is_bestseller}
                  onCheckedChange={(checked) => handleSwitchChange('is_bestseller', checked)}
                />
                <Label htmlFor="is_bestseller" className="cursor-pointer">Bestseller</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "{editingProduct?.title}"? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => editingProduct && handleDeleteProduct(editingProduct.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
