
import { ServiceCategory } from "@/types/services";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ServiceCategoryListProps {
  categories: ServiceCategory[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
}

export const ServiceCategoryList: React.FC<ServiceCategoryListProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="w-[240px] border-r pr-1">
      <h4 className="font-medium text-sm mb-2 px-2">Categories</h4>
      <ScrollArea className="h-[500px]">
        <div className="space-y-1 pr-2">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant="ghost"
              className={cn(
                "w-full justify-start font-normal",
                selectedCategory === category.name
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-700"
                  : "hover:bg-gray-100"
              )}
              onClick={() => onCategorySelect(category.name)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
