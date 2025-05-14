
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";

interface ViewModeToggleProps {
  viewMode: "table" | "cards";
  setViewMode: (mode: "table" | "cards") => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="bg-gray-100 rounded-lg p-1 flex">
      <Button
        variant={viewMode === "cards" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("cards")}
        className={`rounded-md mr-1 ${
          viewMode === "cards" 
            ? "bg-white text-indigo-600 border border-gray-200 shadow-sm" 
            : "text-gray-500 hover:text-indigo-600"
        }`}
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        <span className="text-xs">Cards</span>
      </Button>
      
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("table")}
        className={`rounded-md ${
          viewMode === "table" 
            ? "bg-white text-indigo-600 border border-gray-200 shadow-sm" 
            : "text-gray-500 hover:text-indigo-600"
        }`}
      >
        <Table className="h-4 w-4 mr-1" />
        <span className="text-xs">Table</span>
      </Button>
    </div>
  );
};
