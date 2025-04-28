
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
    <div className="w-[280px] border-r pr-1">
      <h4 className="font-medium text-sm mb-3 px-2">Categories</h4>
      <ScrollArea className="h-[450px]">
        <div className="space-y-1 pr-2">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant="ghost"
              className={cn(
                "w-full justify-start font-normal text-sm h-10",
                selectedCategory === category.name
                  ? "bg-esm-blue-50 text-esm-blue-700 hover:bg-esm-blue-100 hover:text-esm-blue-700"
                  : "hover:bg-muted/50"
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
