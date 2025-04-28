
import { ServiceCategory } from "@/types/services";

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
    <div className="space-y-2 border-r pr-4">
      <h4 className="font-medium text-sm text-blue-800 border-b pb-1 mb-2">
        Categories
      </h4>
      {categories.map((category) => (
        <div
          key={category.name}
          className={`cursor-pointer p-2 rounded-lg transition-colors ${
            selectedCategory === category.name
              ? "bg-blue-100 text-blue-800"
              : "hover:bg-gray-100"
          }`}
          onClick={() => onCategorySelect(category.name)}
        >
          {category.name}
        </div>
      ))}
    </div>
  );
};
