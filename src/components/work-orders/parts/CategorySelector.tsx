import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { getInventoryCategories, addInventoryCategory } from '@/services/inventory/categoryService';
import { toast } from 'sonner';

interface CategorySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CategorySelector({ value, onChange, placeholder = "Select category..." }: CategorySelectorProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async () => {
    try {
      console.log('CategorySelector: Fetching categories...');
      setLoading(true);
      const categoryList = await getInventoryCategories();
      console.log('CategorySelector: Received categories:', categoryList);
      setCategories(categoryList);
    } catch (error) {
      console.error('CategorySelector: Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.toLowerCase() === newCategory.trim().toLowerCase())) {
      toast.error('Category already exists');
      return;
    }

    try {
      setAdding(true);
      await addInventoryCategory(newCategory.trim());
      
      // Refresh categories list
      await fetchCategories();
      
      // Select the newly added category
      onChange(newCategory.trim());
      
      // Reset form
      setNewCategory('');
      setShowAddDialog(false);
      
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading categories..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={categories.length > 0 ? placeholder : "No categories available"} />
          </SelectTrigger>
          <SelectContent>
            {/* Search input */}
            <div className="flex items-center px-3 py-2 border-b">
              <Search className="h-4 w-4 mr-2 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none p-0 h-auto focus-visible:ring-0"
              />
            </div>
            
            {/* Add Other option */}
            <SelectItem value="__add_other__" onSelect={() => setShowAddDialog(true)}>
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Other...
              </div>
            </SelectItem>
            
            {/* Existing categories */}
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-slate-500 text-sm">
                {searchTerm ? 'No categories match your search' : 'No categories found'}
              </div>
            )}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setNewCategory('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddCategory} 
                disabled={adding || !newCategory.trim()}
              >
                {adding ? 'Adding...' : 'Add Category'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
