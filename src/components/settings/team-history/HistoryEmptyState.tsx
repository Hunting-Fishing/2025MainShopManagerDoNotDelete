
import React from "react";

interface HistoryEmptyStateProps {
  hasFilters: boolean;
}

export const HistoryEmptyState = ({ hasFilters }: HistoryEmptyStateProps) => {
  return (
    <div className="text-center py-10 border rounded-lg bg-gray-50">
      <p className="text-muted-foreground">No team history records found.</p>
      {hasFilters && (
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
      )}
    </div>
  );
};
