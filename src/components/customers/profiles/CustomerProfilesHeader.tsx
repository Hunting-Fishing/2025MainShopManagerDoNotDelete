
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Grid, List, Users } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface CustomerProfilesHeaderProps {
  totalCustomers: number;
  filteredCount: number;
  onExport: () => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function CustomerProfilesHeader({ 
  totalCustomers, 
  filteredCount,
  onExport,
  view,
  onViewChange
}: CustomerProfilesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="mr-2 h-6 w-6 text-primary" />
          Customer Profiles
        </h1>
        <p className="text-muted-foreground">
          {filteredCount === totalCustomers 
            ? `Showing all ${totalCustomers} customer profiles` 
            : `Showing ${filteredCount} of ${totalCustomers} customer profiles`}
        </p>
      </div>
      
      <div className="flex space-x-3 items-center">
        {/* View toggle buttons */}
        <div className="bg-muted/20 rounded-xl p-1 mr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={view === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-lg h-9 w-9"
                  onClick={() => onViewChange('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-lg h-9 w-9"
                  onClick={() => onViewChange('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Export button */}
        <Button onClick={onExport} variant="outline" className="flex items-center">
          <FileDown className="mr-1 h-4 w-4" />
          Export
        </Button>
        
        {/* Add new customer button */}
        <Button asChild>
          <a href="/customers/new">Add Customer</a>
        </Button>
      </div>
    </div>
  );
}
