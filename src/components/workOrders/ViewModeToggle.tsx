
import React from 'react';
import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ViewModeToggleProps {
  viewMode: 'table' | 'card';
  onViewModeChange: (mode: 'table' | 'card') => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-medium">Work Orders</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={16} className="text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>View and manage all work orders</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Tabs 
        value={viewMode} 
        onValueChange={(value) => onViewModeChange(value as 'table' | 'card')}
        className="w-auto"
      >
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="card">Card</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
