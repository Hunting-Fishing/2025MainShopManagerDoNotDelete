
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface InventorySearchProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export const InventorySearch: React.FC<InventorySearchProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search inventory by name, SKU, or description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-8 w-full"
      />
    </div>
  );
};
