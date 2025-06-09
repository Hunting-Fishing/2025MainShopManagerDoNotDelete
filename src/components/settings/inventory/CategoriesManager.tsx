
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Wrench, Car, Zap, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  getInventoryCategoriesWithDetails, 
  addInventoryCategory, 
  deleteInventoryCategory,
  getCategoriesBySystem
} from "@/services/inventory/categoryService";
import { toast } from "@/hooks/use-toast";

interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

export function CategoriesManager() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<Record<string, InventoryCategory[]>>({});
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const [loadedCategories, grouped] = await Promise.all([
        getInventoryCategoriesWithDetails(),
        getCategoriesBySystem()
      ]);
      setCategories(loadedCategories);
      setGroupedCategories(grouped);
    } catch (error) {
      console.error("Error loading automotive inventory categories:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load inventory categories"
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    // Check for duplicates
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This category already exists"
      });
      return;
    }

    setIsLoading(true);
    try {
      await addInventoryCategory(newCategory.trim(), newDescription.trim() || undefined);
      await loadCategories();
      setNewCategory("");
      setNewDescription("");
      toast({
        variant: "success",
        title: "Success",
        description: "Category added successfully"
      });
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to add category"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        await deleteInventoryCategory(categoryName);
        await loadCategories();
        toast({
          variant: "success",
          title: "Success",
          description: "Category deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting category:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete category"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getSystemIcon = (systemName: string) => {
    switch (systemName) {
      case 'Engine & Powertrain':
        return <Settings className="h-4 w-4" />;
      case 'Chassis & Safety':
        return <Car className="h-4 w-4" />;
      case 'Electrical & Comfort':
        return <Zap className="h-4 w-4" />;
      case 'Body & Interior':
        return <Car className="h-4 w-4" />;
      case 'Maintenance & Tools':
        return <Wrench className="h-4 w-4" />;
      case 'Aftermarket & Accessories':
        return <PlusCircle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Automotive Inventory Categories
        </CardTitle>
        <CardDescription>
          Manage the comprehensive automotive categories used to organize your inventory items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="organized" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organized">By System</TabsTrigger>
            <TabsTrigger value="all">All Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organized" className="space-y-6">
            <div className="grid gap-4">
              {Object.entries(groupedCategories).map(([systemName, systemCategories]) => (
                <Card key={systemName} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getSystemIcon(systemName)}
                      {systemName}
                      <Badge variant="outline" className="ml-auto">
                        {systemCategories.length} categories
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {systemCategories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="font-medium">{category.name}</div>
                            {category.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {category.description}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="border rounded-md">
              {categories.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No categories yet. Add your first category below.
                </div>
              ) : (
                <div className="divide-y">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground">
                            {category.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Order: {category.display_order}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-4">Add New Category</h3>
          <div className="space-y-3">
            <Input
              placeholder="Category name (e.g., 'Custom Performance Parts')"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Textarea
              placeholder="Category description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
            />
            <Button 
              onClick={handleAddCategory} 
              disabled={!newCategory.trim() || isLoading}
              className="w-full"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
