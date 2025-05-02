
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash,
  Plus,
  Search,
  MoveUp,
  MoveDown,
  ExternalLink,
  Tag,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  subcategories?: string[];
  productCount?: number;
}

const CategoriesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use React Query to fetch categories
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      // In a real implementation, this would fetch from your database
      await new Promise(resolve => setTimeout(resolve, 800));
      return [];
    },
  });
  
  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    return categories.filter((category: Category) => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);
  
  const handleAddCategory = () => {
    console.log("Add category clicked");
  };
  
  const handleEditCategory = (id: string) => {
    console.log(`Edit category ${id}`);
  };
  
  const handleDeleteCategory = (id: string) => {
    console.log(`Delete category ${id}`);
  };
  
  const handleMoveUp = (id: string) => {
    console.log(`Move up category ${id}`);
  };
  
  const handleMoveDown = (id: string) => {
    console.log(`Move down category ${id}`);
  };
  
  const handleViewProducts = (id: string) => {
    console.log(`View products in category ${id}`);
  };
  
  if (error) {
    return (
      <Card className="bg-white shadow-md rounded-lg mb-6">
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-red-500">Error loading categories. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md rounded-lg mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Category Management</CardTitle>
          <Button 
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleAddCategory}
          >
            <Plus size={16} />
            <span>Add Category</span>
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
                <p className="text-muted-foreground">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No categories found.</p>
                <Button 
                  variant="outline" 
                  onClick={handleAddCategory}
                >
                  Add your first category
                </Button>
              </div>
            ) : (
              filteredCategories.map((category: Category) => (
                <div 
                  key={category.id}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">{category.name}</h3>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {category.productCount || 0} products
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                      
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {category.subcategories.map((subcat, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {subcat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleMoveUp(category.id)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <MoveUp className="h-4 w-4" />
                        <span className="sr-only">Move up</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleMoveDown(category.id)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <MoveDown className="h-4 w-4" />
                        <span className="sr-only">Move down</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewProducts(category.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View products</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditCategory(category.id)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesManagement;
