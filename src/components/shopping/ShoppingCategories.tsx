
import React from 'react';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
  name: string;
  subcategories?: string[];
}

export function ShoppingCategories() {
  const [isOpen, setIsOpen] = React.useState(true);
  
  const categories: Category[] = [
    {
      name: "All Categories"
    },
    {
      name: "Consumables",
      subcategories: ["Oils & Fluids"]
    },
    {
      name: "Tools",
      subcategories: ["Hand Tools", "Power Tools"]
    },
    {
      name: "User Suggestions"
    }
  ];

  return (
    <div className="bg-white rounded-md shadow-sm border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer">
            <h3 className="font-medium">Categories</h3>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t">
          <div className="p-2">
            {categories.map((category, index) => (
              <div key={index} className="mb-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start font-normal hover:bg-slate-100"
                >
                  {category.name}
                </Button>
                {category.subcategories?.map((subcategory, subIndex) => (
                  <Button 
                    key={subIndex} 
                    variant="ghost" 
                    className="w-full justify-start pl-6 font-normal text-sm hover:bg-slate-100"
                  >
                    {subcategory}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
