
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Changed from card to badge
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { extractAmazonASIN } from '@/utils/amazonUtils';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, PlusCircle, Trash2, Check, X } from 'lucide-react';

// Define types for our data structures
interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  affiliate_link: string;
  price: number;
  category_id: string;
  is_featured: boolean;
  is_approved: boolean;
  is_bestseller: boolean;
  // Adding the category property to match with how we're using it
  category?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Manufacturer {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  logo_url?: string;
  slug: string;
  description?: string;
  category: string;
  featured: boolean;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('all');

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_categories:category_id(name, slug)
          `);
        
        if (productsError) throw productsError;
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('product_categories')
          .select('*');
          
        if (categoriesError) throw categoriesError;
        
        // Fetch manufacturers
        const { data: manufacturersData, error: manufacturersError } = await supabase
          .from('manufacturers')
          .select('*');
          
        if (manufacturersError) throw manufacturersError;

        // Combine product data with category names
        const processedProducts = productsData.map(product => {
          return {
            ...product,
            category: product.product_categories ? product.product_categories.name : 'Uncategorized'
          };
        });
        
        setProducts(processedProducts);
        setCategories(categoriesData || []);
        setManufacturers(manufacturersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter products based on search and filter settings
  const filteredProducts = products.filter(product => {
    const matchesSearch = filter === '' || 
      product.title?.toLowerCase().includes(filter.toLowerCase()) || 
      product.description?.toLowerCase().includes(filter.toLowerCase());
      
    const matchesCategory = categoryFilter === '' || product.category_id === categoryFilter;
    
    const matchesApproval = approvedFilter === 'all' || 
      (approvedFilter === 'approved' && product.is_approved) ||
      (approvedFilter === 'pending' && !product.is_approved);
      
    return matchesSearch && matchesCategory && matchesApproval;
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setCurrentProduct(prev => ({ ...prev, [name]: checked }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (isEditing && currentProduct.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            title: currentProduct.title,
            description: currentProduct.description,
            image_url: currentProduct.image_url,
            affiliate_link: currentProduct.affiliate_link,
            price: currentProduct.price,
            category_id: currentProduct.category_id,
            is_featured: currentProduct.is_featured,
            is_approved: currentProduct.is_approved
          })
          .eq('id', currentProduct.id);
          
        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            title: currentProduct.title,
            description: currentProduct.description,
            image_url: currentProduct.image_url,
            affiliate_link: currentProduct.affiliate_link,
            price: currentProduct.price,
            category_id: currentProduct.category_id,
            is_featured: currentProduct.is_featured || false,
            is_approved: currentProduct.is_approved || false
          });
          
        if (error) throw error;
      }
      
      // Refresh product list
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories:category_id(name, slug)
        `);
      
      if (error) throw error;
      
      // Process the returned data
      const processedProducts = data.map(product => {
        return {
          ...product,
          category: product.product_categories ? product.product_categories.name : 'Uncategorized'
        };
      });
      
      setProducts(processedProducts);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  // Handle product deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Handle edit button click
  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Reset form and dialog state
  const resetForm = () => {
    setCurrentProduct({});
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  // Parse Amazon URL to extract product ID
  const handleAmazonUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCurrentProduct(prev => ({ ...prev, affiliate_link: url }));
    
    // Try to extract product ID from Amazon URL
    const asin = extractAmazonASIN(url);
    if (asin) {
      // If successful, generate image URL and update form
      const imageUrl = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822`;
      setCurrentProduct(prev => ({ ...prev, image_url: imageUrl }));
    }
  };

  // Toggle product approval status
  const toggleApproval = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_approved: !product.is_approved })
        .eq('id', product.id);
        
      if (error) throw error;
      
      // Update local state
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_approved: !product.is_approved } : p
      ));
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  };

  // Toggle featured product status
  const toggleFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !product.is_featured })
        .eq('id', product.id);
        
      if (error) throw error;
      
      // Update local state
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_featured: !product.is_featured } : p
      ));
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products Management</h2>
          <p className="text-muted-foreground">Manage affiliate products in the shop.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setCurrentProduct({});
              setIsEditing(false);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update product details' : 'Enter product details to add it to the shop'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Product Title</Label>
                  <Input 
                    id="title" 
                    name="title"
                    value={currentProduct.title || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    name="description"
                    value={currentProduct.description || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="affiliate_link">Amazon Affiliate Link</Label>
                  <Input 
                    id="affiliate_link" 
                    name="affiliate_link"
                    value={currentProduct.affiliate_link || ''} 
                    onChange={handleAmazonUrlChange} 
                    placeholder="https://www.amazon.com/dp/..." 
                  />
                </div>
                
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input 
                    id="image_url" 
                    name="image_url"
                    value={currentProduct.image_url || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input 
                    id="price" 
                    name="price"
                    type="number"
                    value={currentProduct.price || ''} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={currentProduct.category_id || ''} 
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
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_featured" 
                    checked={currentProduct.is_featured || false} 
                    onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)} 
                  />
                  <Label htmlFor="is_featured">Featured Product</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="is_approved" 
                    checked={currentProduct.is_approved || false} 
                    onCheckedChange={(checked) => handleSwitchChange('is_approved', checked)} 
                  />
                  <Label htmlFor="is_approved">Approve Product</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? 'Update' : 'Add'} Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white shadow-md rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search products..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          <div className="w-[200px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-[200px]">
            <Select value={approvedFilter} onValueChange={setApprovedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center p-6">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-6">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 overflow-hidden rounded-md bg-gray-100">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.title} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">{product.title}</div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      ${product.price?.toFixed(2) || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Badge 
                          variant={product.is_approved ? "success" : "outline"} 
                          className={product.is_approved ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                          onClick={() => toggleApproval(product)}
                        >
                          {product.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                        
                        {product.is_featured && (
                          <Badge 
                            variant="outline" 
                            className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                            onClick={() => toggleFeatured(product)}
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700" 
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={product.is_featured ? "text-purple-600" : "text-gray-600"} 
                          onClick={() => toggleFeatured(product)}
                        >
                          {product.is_featured ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <PlusCircle className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;
