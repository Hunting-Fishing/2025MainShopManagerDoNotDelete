
import React from "react";
import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewModeToggleProps {
  viewMode: "table" | "cards";
  setViewMode: (mode: "table" | "cards") => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setViewMode("table")}
        className={viewMode === "table" ? "bg-muted/50" : ""}
      >
        <List className="h-4 w-4 mr-1" />
        Table
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setViewMode("cards")}
        className={viewMode === "cards" ? "bg-muted/50" : ""}
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Cards
      </Button>
    </div>
  );
};
