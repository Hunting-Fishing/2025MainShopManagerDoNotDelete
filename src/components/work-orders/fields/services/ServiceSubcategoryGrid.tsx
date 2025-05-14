import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ServiceSubcategoryGridProps {
  category: string;
  subcategories: string[];
  selectedSubcategory: string | null;
  onSelectSubcategory: (subcategory: string) => void;
}

export const ServiceSubcategoryGrid: React.FC<ServiceSubcategoryGridProps> = ({
  category,
  subcategories,
  selectedSubcategory,
  onSelectSubcategory
}) => {
  // Keep track of expanded subcategories
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  
  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  return (
    <TooltipProvider>
      <ScrollArea className="h-[450px] flex-1">
        <div className="p-2">
          <h3 className="font-medium mb-3 text-sm">
            Subcategories for {category}
          </h3>
          <div className="space-y-1">
            {subcategories.map((subcategory, index) => (
              <Button
                key={`${subcategory}-${index}`}
                variant="ghost"
                className={`w-full justify-start text-left h-9 ${selectedSubcategory === subcategory ? 'bg-muted font-medium' : ''}`}
                onClick={() => onSelectSubcategory(subcategory)}
              >
                {subcategory}
                {selectedSubcategory === subcategory && (
                  <span className="ml-auto">
                    <ChevronUp className="h-4 w-4" />
                  </span>
                )}
              </Button>
            ))}
          </div>
          
          {subcategories.length === 0 && (
            <div className="text-center text-muted-foreground p-4">
              No subcategories available
            </div>
          )}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
