import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToolCategory } from '@/types/affiliate';
import { Plus, Search, Pencil, Trash2, FolderTree } from 'lucide-react';

// Sample categories for demonstration
const sampleCategories: ToolCategory[] = [
  { id: '1', name: 'Hand Tools', description: 'Wrenches, screwdrivers, and other hand tools', slug: 'hand-tools' },
  { id: '2', name: 'Power Tools', description: 'Drills, saws, and other power tools', slug: 'power-tools' },
  { id: '3', name: 'Diagnostic Tools', description: 'OBD scanners and diagnostic equipment', slug: 'diagnostic' },
  { id: '4', name: 'Body Clips & Fasteners', description: 'Body clips, fasteners, and related accessories', slug: 'clips-fasteners' },
  { id: '5', name: 'Specialty Tools', description: 'Specialty automotive tools', slug: 'specialty' },
  { id: '6', name: 'Shop Equipment', description: 'Lifts, jacks, and other shop equipment', slug: 'shop-equipment' },
];

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<ToolCategory[]>(sampleCategories);
  const [editCategory, setEditCategory] = useState<ToolCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredCategories = searchTerm
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categories;

  const handleSaveCategory = (category: ToolCategory) => {
    if (editCategory) {
      // Update existing category
      setCategories(categories.map(c => c.id === category.id ? category : c));
    } else {
      // Add new category
      const newCategory = { ...category, id: String(Date.now()) };
      setCategories([...categories, newCategory]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Categories Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditCategory(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <CategoryForm 
              category={editCategory} 
              onSave={handleSaveCategory} 
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px]">Slug</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  No categories found. Add your first category to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FolderTree className="h-4 w-4" />
                    {category.name}
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell><code>{category.slug}</code></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => setEditCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <CategoryForm 
                          category={category} 
                          onSave={handleSaveCategory}
                          onCancel={() => setIsDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface CategoryFormProps {
  category: ToolCategory | null;
  onSave: (category: ToolCategory) => void;
  onCancel: () => void;
}

function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const isEditing = !!category;
  
  const [formData, setFormData] = useState<ToolCategory>(
    category || {
      id: '',
      name: '',
      description: '',
      slug: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from name if it's not editing mode
    if (name === 'name' && (!isEditing || !formData.slug)) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData({ ...formData, [name]: value, slug: generatedSlug });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>
        <DialogDescription>
          {isEditing 
            ? "Update the category details below." 
            : "Enter the details for the new category."}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            pattern="[a-z0-9-]+"
            title="Slug must contain only lowercase letters, numbers, and hyphens"
          />
          <p className="text-xs text-slate-500">
            The slug is used in URLs and should contain only lowercase letters, numbers, and hyphens.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Update" : "Add"} Category</Button>
        </DialogFooter>
      </form>
    </>
  );
}
