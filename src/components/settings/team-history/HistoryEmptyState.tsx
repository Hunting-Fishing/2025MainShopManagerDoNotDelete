
import React from "react";
import { ClipboardList, Filter } from "lucide-react";

interface HistoryEmptyStateProps {
  hasFilters: boolean;
}

export function HistoryEmptyState({ hasFilters }: HistoryEmptyStateProps) {
  return (
    <div className="border rounded-md p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {hasFilters ? (
          <Filter className="h-6 w-6 text-gray-500" />
        ) : (
          <ClipboardList className="h-6 w-6 text-gray-500" />
        )}
      </div>
      <h3 className="text-lg font-medium">
        {hasFilters ? "No matching records found" : "No history records yet"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        {hasFilters
          ? "Try adjusting your search or filter to find what you're looking for."
          : "Team member activity will be recorded here as they interact with the system."}
      </p>
    </div>
  );
}
