
import React from 'react';
import { Button } from "@/components/ui/button";

interface ServiceCategoryListProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
}

export function ServiceCategoryList({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: ServiceCategoryListProps) {
  return (
    <div className="h-full">
      <div className="p-2 border-b">
        <h3 className="font-medium text-sm">Categories</h3>
      </div>
      <div className="p-2 overflow-y-auto max-h-56">
        <ul className="space-y-1">
          {categories.map((category, index) => (
            <li key={index}>
              <Button
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start text-left ${
                  selectedCategory === category 
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-800" 
                    : ""
                }`}
                onClick={() => onCategorySelect(category)}
              >
                {category}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
