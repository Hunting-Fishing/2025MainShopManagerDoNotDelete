
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, Wrench, Hammer, Truck, Gauge, Scissors } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ToolCategory {
  category: string;
  items: string[];
  description?: string;
  icon?: React.ComponentType<any>;
  isNew?: boolean;
  isPopular?: boolean;
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
    console.log(`Navigating to category: ${slug}`);
    navigate(`/shopping/categories/${slug}`);
  };

  const getIconForCategory = (category: string) => {
    // Map categories to icons based on their name - using only available icons
    const categoryToIcon: Record<string, React.ComponentType<any>> = {
      "Hand Tools": Wrench,
      "Power Tools": Gauge,
      "Diagnostic Tools": Gauge,
      "Shop Equipment": Wrench,
      "Specialty Tools": Wrench,
      "Body Shop": Hammer,
      "Cleaning Supplies": Scissors,
      "Lighting": Scissors,
      "Lifting Equipment": Truck,
    };
    
    return categoryToIcon[category] || Wrench;
  };
  
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {tools.map((toolCategory, index) => {
            const Icon = toolCategory.icon || getIconForCategory(toolCategory.category);
            
            return (
              <Card 
                key={index} 
                className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleCategoryClick(toolCategory.category)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium group-hover:text-blue-600 transition-colors">
                            {toolCategory.category}
                          </h3>
                          {toolCategory.isNew && (
                            <Badge className="bg-green-100 text-green-800 border border-green-300">New</Badge>
                          )}
                          {toolCategory.isPopular && (
                            <Badge className="bg-amber-100 text-amber-800 border border-amber-300">Popular</Badge>
                          )}
                        </div>
                        {toolCategory.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {toolCategory.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the card click from firing too
                        handleCategoryClick(toolCategory.category);
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  
                  {toolCategory.items.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {toolCategory.items.slice(0, 6).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center py-1">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                          <span className="text-sm text-slate-600 truncate">{item}</span>
                        </div>
                      ))}
                      {toolCategory.items.length > 6 && (
                        <div className="col-span-2 text-sm text-blue-500 mt-1">
                          +{toolCategory.items.length - 6} more items
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No items available</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
