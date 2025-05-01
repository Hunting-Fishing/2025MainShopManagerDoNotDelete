
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/card";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractAmazonASIN } from '@/utils/amazonUtils';

// Define types based on the actual database schema
interface Product {
  id: string;
  title: string;
  description: string;
  affiliate_link: string;
  price: number;
  category_id: string;
  image_url: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface Manufacturer {
  id: string;
  name: string;
  created_at: string;
}

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState({
    category: "",
    status: "",
    search: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchManufacturers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch products and join with categories to get category name
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories:category_id(id, name)
        `);

      if (error) throw error;

      // Transform the data to include the category name for easier rendering
      const productsWithCategory = data.map(product => ({
        ...product,
        category_name: product.product_categories?.name || 'Uncategorized'
      }));

      setProducts(productsWithCategory as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('id, name');

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchManufacturers = async () => {
    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('id, name');

      if (error) throw error;
      setManufacturers(data as Manufacturer[]);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      toast.error('Failed to load manufacturers');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.filter(product => product.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: editingProduct.title,
          description: editingProduct.description,
          price: editingProduct.price,
          affiliate_link: editingProduct.affiliate_link,
          category_id: editingProduct.category_id,
          is_featured: editingProduct.is_featured,
          is_approved: editingProduct.is_approved,
          image_url: editingProduct.image_url
        })
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      // Update local state
      setProducts(products.map(p => p.id === editingProduct.id ? {
        ...editingProduct,
        category_name: categories.find(c => c.id === editingProduct.category_id)?.name || 'Uncategorized'
      } : p));
      
      setEditingProduct(null);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct) return;
    const { name, value, type, checked } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      [field]: value
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleStatusChange = (status: string) => {
    setFilter({ ...filter, status });
  };

  const handleCategoryFilterChange = (category: string) => {
    setFilter({ ...filter, category });
  };

  // Process Amazon URL to extract ASIN and create clean affiliate link
  const processAmazonLink = (url: string) => {
    if (!url.includes('amazon.')) return url;
    
    // Extract ASIN
    const asin = extractAmazonASIN(url);
    if (!asin) return url;
    
    // Create clean link
    return `https://amazon.com/dp/${asin}?tag=yourtag-20`;
  };

  const filteredProducts = products.filter(product => {
    // Apply search filter
    if (filter.search && !product.title.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    // Apply category filter
    if (filter.category && product.category_id !== filter.category) {
      return false;
    }
    
    // Apply status filter
    if (filter.status) {
      if (filter.status === 'approved' && !product.is_approved) return false;
      if (filter.status === 'pending' && product.is_approved) return false;
    }
    
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 bg-white shadow-md rounded-xl border border-gray-100 p-4">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input 
              placeholder="Search products..." 
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              className="border-gray-300"
            />
          </div>
          
          <div className="w-[180px]">
            <Select 
              value={filter.category} 
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
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
          
          <div className="w-[180px]">
            <Select 
              value={filter.status} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : (
        <div className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No products found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {editingProduct && editingProduct.id === product.id ? (
                        <Input 
                          name="title" 
                          value={editingProduct.title} 
                          onChange={handleChange} 
                        />
                      ) : (
                        product.title
                      )}
                    </TableCell>
                    <TableCell>
                      {editingProduct && editingProduct.id === product.id ? (
                        <Input 
                          name="price" 
                          type="number" 
                          value={editingProduct.price} 
                          onChange={handleChange}
                        />
                      ) : (
                        `$${product.price}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingProduct && editingProduct.id === product.id ? (
                        <Select 
                          value={editingProduct.category_id} 
                          onValueChange={(value) => handleSelectChange('category_id', value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                          {product.category_name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingProduct && editingProduct.id === product.id ? (
                        <Select 
                          value={editingProduct.is_approved ? "approved" : "pending"} 
                          onValueChange={(value) => handleSelectChange('is_approved', value === 'approved' ? 'true' : 'false')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          product.is_approved 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}>
                          {product.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingProduct && editingProduct.id === product.id ? (
                        <input 
                          type="checkbox" 
                          name="is_featured" 
                          checked={editingProduct.is_featured} 
                          onChange={handleChange}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                      ) : (
                        product.is_featured ? (
                          <span className="text-sm font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                            Featured
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">No</span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingProduct && editingProduct.id === product.id ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={handleSave}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
