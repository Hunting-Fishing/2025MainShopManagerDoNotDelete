
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const CategoriesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCategories();
    fetchProductCounts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category_id');

      if (error) {
        console.error('Error fetching product counts:', error);
        return;
      }

      const counts: Record<string, number> = {};
      data?.forEach(product => {
        if (product.category_id) {
          counts[product.category_id] = (counts[product.category_id] || 0) + 1;
        }
      });

      setProductCounts(counts);
    } catch (error) {
      console.error('Error fetching product counts:', error);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCategory = () => {
    toast.info('Add Category functionality will be implemented');
  };

  const handleEditCategory = (categoryId: string) => {
    toast.info(`Edit Category ${categoryId} functionality will be implemented`);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        throw error;
      }

      toast.success('Category deleted successfully');
      fetchCategories();
      fetchProductCounts();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-md rounded-xl border border-gray-100">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-md rounded-xl border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            Product Categories
            <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
              {categories.length} categories
            </Badge>
          </CardTitle>
          <Button onClick={handleAddCategory} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="border rounded-xl p-4 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      Active
                    </Badge>
                  </div>
                  
                  {category.description && (
                    <p className="text-gray-600 mb-3">{category.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">
                        <span className="font-medium text-blue-600">{productCounts[category.id] || 0}</span> products
                      </span>
                    </div>
                    <div className="text-gray-500">
                      Created: {new Date(category.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditCategory(category.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">
                  {searchTerm ? 'No categories match your search' : 'No categories found'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add your first category to get started'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriesManagement;
