
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  isActive: boolean;
  parentId?: string;
}

const CategoriesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories] = useState<Category[]>([
    {
      id: '1',
      name: 'Power Tools',
      description: 'Electric and battery-powered tools for automotive work',
      productCount: 45,
      isActive: true
    },
    {
      id: '2',
      name: 'Hand Tools',
      description: 'Manual tools and precision instruments',
      productCount: 78,
      isActive: true
    },
    {
      id: '3',
      name: 'Diagnostic Equipment',
      description: 'Advanced diagnostic and testing equipment',
      productCount: 23,
      isActive: true
    },
    {
      id: '4',
      name: 'Safety Equipment',
      description: 'Personal protective equipment and safety gear',
      productCount: 34,
      isActive: true
    },
    {
      id: '5',
      name: 'Specialty Tools',
      description: 'Specialized tools for specific automotive tasks',
      productCount: 19,
      isActive: false
    }
  ]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    toast.info('Add Category functionality will be implemented');
  };

  const handleEditCategory = (categoryId: string) => {
    toast.info(`Edit Category ${categoryId} functionality will be implemented`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    toast.info(`Delete Category ${categoryId} functionality will be implemented`);
  };

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
                    <Badge variant={category.isActive ? "default" : "secondary"} className={category.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">
                        <span className="font-medium text-blue-600">{category.productCount}</span> products
                      </span>
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
