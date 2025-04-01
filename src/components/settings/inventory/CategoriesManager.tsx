
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getInventoryCategories, 
  addInventoryCategory, 
  deleteInventoryCategory 
} from "@/services/inventory/categoryService";
import { toast } from "@/hooks/use-toast";

export function CategoriesManager() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const loadedCategories = await getInventoryCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error loading inventory categories:", error);
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
    if (categories.includes(newCategory.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This category already exists"
      });
      return;
    }

    setIsLoading(true);
    try {
      await addInventoryCategory(newCategory.trim());
      setCategories([...categories, newCategory.trim()].sort());
      setNewCategory("");
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

  const handleDeleteCategory = async (category: string) => {
    if (confirm(`Are you sure you want to delete "${category}"?`)) {
      setIsLoading(true);
      try {
        await deleteInventoryCategory(category);
        setCategories(categories.filter(c => c !== category));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Categories</CardTitle>
        <CardDescription>
          Manage the categories used to organize your inventory items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="max-w-sm"
          />
          <Button 
            onClick={handleAddCategory} 
            disabled={!newCategory.trim() || isLoading}
            type="button"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="border rounded-md">
          {categories.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No categories yet. Add your first category above.
            </div>
          ) : (
            <div className="divide-y">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <span>{category}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
