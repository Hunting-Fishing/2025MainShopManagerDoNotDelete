
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {tools.map((toolCategory, index) => (
            <Card key={index} className="overflow-hidden border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-2">{toolCategory.category}</h3>
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
