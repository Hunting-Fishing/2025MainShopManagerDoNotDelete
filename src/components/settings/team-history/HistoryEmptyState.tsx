
import React from "react";
import { SearchX, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryEmptyStateProps {
  hasFilters: boolean;
  onRefresh?: () => void;
}

export function HistoryEmptyState({ hasFilters, onRefresh }: HistoryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <div className="bg-muted/30 w-12 h-12 rounded-full flex items-center justify-center">
        <SearchX className="h-6 w-6 text-muted-foreground" />
      </div>
      
      <h3 className="font-semibold text-lg">No history records found</h3>
      
      {hasFilters ? (
        <p className="text-muted-foreground max-w-sm">
          No team history matches your current filters. Try adjusting your search criteria or clear filters to see all records.
        </p>
      ) : (
        <p className="text-muted-foreground max-w-sm">
          There are no team history records available yet. Team history will appear here when actions are taken.
        </p>
      )}

      {onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={onRefresh}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      )}
    </div>
  );
}
