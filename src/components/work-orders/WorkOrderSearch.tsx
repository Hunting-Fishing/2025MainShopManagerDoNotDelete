import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useServiceCategories } from '@/hooks/workOrders/useServiceCategories';
import { Check, X } from 'lucide-react';

interface WorkOrderSearchProps {
  onSearch: (searchTerm: string) => void;
  onStatusFilterChange: (statuses: string[]) => void;
  onPriorityFilterChange: (priorities: string[]) => void;
  onServiceCategoryChange: (categoryId: string | null) => void;
  onTechnicianFilterChange: (techs: string[]) => void;
  technicians: string[];
}

export const WorkOrderSearch: React.FC<WorkOrderSearchProps> = ({
  onSearch,
  onStatusFilterChange,
  onPriorityFilterChange,
  onServiceCategoryChange,
  onTechnicianFilterChange,
  technicians
}) => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const { categories, isLoading: loadingCategories } = useServiceCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleStatusSelect = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
    onStatusFilterChange(newStatuses);
  };

  const handlePrioritySelect = (priority: string) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority)
      : [...selectedPriorities, priority];
    setSelectedPriorities(newPriorities);
    onPriorityFilterChange(newPriorities);
  };

  const handleCategorySelect = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    onServiceCategoryChange(newCategory);
  };

  return (
    <div className="space-y-4">
      <Input 
        type="search"
        placeholder="Search work orders..."
        className="max-w-sm"
        onChange={(e) => onSearch(e.target.value)}
      />
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Status</h4>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedStatuses.includes("pending") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleStatusSelect("pending")}
          >
            {selectedStatuses.includes("pending") && <Check className="mr-1 h-3 w-3" />}
            Pending
          </Badge>
          <Badge
            variant={selectedStatuses.includes("in-progress") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleStatusSelect("in-progress")}
          >
            {selectedStatuses.includes("in-progress") && <Check className="mr-1 h-3 w-3" />}
            In Progress
          </Badge>
          <Badge
            variant={selectedStatuses.includes("completed") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleStatusSelect("completed")}
          >
            {selectedStatuses.includes("completed") && <Check className="mr-1 h-3 w-3" />}
            Completed
          </Badge>
          <Badge
            variant={selectedStatuses.includes("cancelled") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleStatusSelect("cancelled")}
          >
            {selectedStatuses.includes("cancelled") && <Check className="mr-1 h-3 w-3" />}
            Cancelled
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Priority</h4>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedPriorities.includes("low") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handlePrioritySelect("low")}
          >
            {selectedPriorities.includes("low") && <Check className="mr-1 h-3 w-3" />}
            Low
          </Badge>
          <Badge
            variant={selectedPriorities.includes("medium") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handlePrioritySelect("medium")}
          >
            {selectedPriorities.includes("medium") && <Check className="mr-1 h-3 w-3" />}
            Medium
          </Badge>
          <Badge
            variant={selectedPriorities.includes("high") ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handlePrioritySelect("high")}
          >
            {selectedPriorities.includes("high") && <Check className="mr-1 h-3 w-3" />}
            High
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Service Category</h4>
        <div className="flex flex-wrap gap-2">
          {loadingCategories ? (
            <span className="text-sm text-muted-foreground">Loading categories...</span>
          ) : (
            categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleCategorySelect(category.id)}
              >
                {selectedCategory === category.id && (
                  <Check className="mr-1 h-3 w-3" />
                )}
                {category.name}
                {selectedCategory === category.id && (
                  <X 
                    className="ml-1 h-3 w-3 hover:text-red-500" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategorySelect(category.id);
                    }}
                  />
                )}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Technician</h4>
        <div className="flex flex-wrap gap-2">
          {technicians.map((technician) => (
            <Badge
              key={technician}
              variant={selectedTechnicians.includes(technician) ? "default" : "outline"}
              className="cursor-pointer"
            >
              {technician}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
