
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface SkillCategory {
  name: string;
  skills: string[];
}

interface BaseSkillManagerProps {
  initialCategories: SkillCategory[];
  title: string;
}

export function BaseSkillManager({ initialCategories, title }: BaseSkillManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingSkills, setEditingSkills] = useState<Record<string, boolean>>({});
  const [newSkills, setNewSkills] = useState<Record<string, string>>({});

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, { name: newCategoryName, skills: [] }]);
      setNewCategoryName('');
      setIsAddingCategory(false);
      toast({
        title: "Category added",
        description: `New ${title} category has been created`
      });
    }
  };

  const handleAddSkill = (categoryName: string, skill: string) => {
    setCategories(categories.map(category => {
      if (category.name === categoryName) {
        return {
          ...category,
          skills: [...category.skills, skill]
        };
      }
      return category;
    }));
    setNewSkills({ ...newSkills, [categoryName]: '' });
  };

  const handleRemoveSkill = (categoryName: string, skillToRemove: string) => {
    setCategories(categories.map(category => {
      if (category.name === categoryName) {
        return {
          ...category,
          skills: category.skills.filter(skill => skill !== skillToRemove)
        };
      }
      return category;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title} Categories</h3>
        <Button 
          variant="outline" 
          onClick={() => setIsAddingCategory(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {categories.map((category) => (
        <div key={category.name} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{category.name}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingSkills({ ...editingSkills, [category.name]: true })}
            >
              Add Skills
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {category.skills.map((skill) => (
              <div 
                key={skill}
                className="flex items-center justify-between bg-muted p-2 rounded"
              >
                <span className="text-sm">{skill}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSkill(category.name, skill)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {editingSkills[category.name] && (
            <div className="flex gap-2">
              <Input
                value={newSkills[category.name] || ''}
                onChange={(e) => setNewSkills({ ...newSkills, [category.name]: e.target.value })}
                placeholder="Enter new skill..."
              />
              <Button
                onClick={() => {
                  if (newSkills[category.name]?.trim()) {
                    handleAddSkill(category.name, newSkills[category.name].trim());
                  }
                }}
              >
                Add
              </Button>
            </div>
          )}
        </div>
      ))}

      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
