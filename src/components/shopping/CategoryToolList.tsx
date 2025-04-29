
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ToolCategory {
  category: string;
  items: string[];
}

interface CategoryToolListProps {
  title: string;
  description: string;
  tools: ToolCategory[];
}

export const CategoryToolList: React.FC<CategoryToolListProps> = ({ 
  title, 
  description, 
  tools 
}) => {
  const navigate = useNavigate();
  
  const handleCategoryClick = (category: string) => {
    // Create a URL-friendly slug from the category name
    const slug = category.toLowerCase().replace(/\s+/g, '-');
    navigate(`/shopping/categories/${slug}`);
  };
  
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {tools.map((toolCategory, index) => (
            <Card 
              key={index} 
              className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCategoryClick(toolCategory.category)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">{toolCategory.category}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the card click from firing too
                      handleCategoryClick(toolCategory.category);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {toolCategory.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
