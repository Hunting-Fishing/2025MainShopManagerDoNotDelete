
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToolCategory } from "@/types/affiliate";
import { Category } from "lucide-react";

interface CategoryGridProps {
  categories: ToolCategory[];
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Category className="h-5 w-5" />
                {category.name}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              {/* Content could include a small image or icon representing the category */}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Browse {category.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
