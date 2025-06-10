
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineCard } from './JobLineCard';
import { JobLinesTable } from './JobLinesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Wrench, LayoutList, LayoutGrid, Package, TrendingUp } from 'lucide-react';

interface JobLinesGridProps {
  jobLines: WorkOrderJobLine[];
  showSummary?: boolean;
  isEditMode?: boolean;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onAddParts?: (jobLineId: string, parts: any[]) => void;
  onRemovePart?: (partId: string) => void;
}

export function JobLinesGrid({ 
  jobLines, 
  showSummary = true,
  isEditMode = false,
  onUpdate = () => {},
  onDelete = () => {},
  onAddParts,
  onRemovePart
}: JobLinesGridProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const totalHours = jobLines.reduce((sum, line) => sum + (line.estimatedHours || 0), 0);
  const totalAmount = jobLines.reduce((sum, line) => sum + (line.totalAmount || 0), 0);
  
  // Calculate parts totals from all job lines
  const partsCalculations = jobLines.reduce((totals, line) => {
    const lineParts = line.parts || [];
    
    lineParts.forEach(part => {
      totals.totalParts += part.quantity;
      totals.totalPartsCost += (part.supplierCost * part.quantity);
      totals.totalPartsSellPrice += (part.customerPrice * part.quantity);
    });
    
    return totals;
  }, {
    totalParts: 0,
    totalPartsCost: 0,
    totalPartsSellPrice: 0
  });
  
  const partsMargin = partsCalculations.totalPartsSellPrice - partsCalculations.totalPartsCost;
  const partsMarginPercent = partsCalculations.totalPartsCost > 0 
    ? ((partsMargin / partsCalculations.totalPartsCost) * 100) 
    : 0;

  if (jobLines.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Job Lines Found</h3>
          <p className="text-sm text-muted-foreground text-center">
            Job lines will be automatically parsed from the work order description.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Service Details</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {jobLines.length} service{jobLines.length !== 1 ? 's' : ''}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/50">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
            >
              <LayoutList className="h-4 w-4 mr-2" />
              Row View
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Card View
            </Button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <JobLinesTable
          jobLines={jobLines}
          isEditMode={isEditMode}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddParts={onAddParts}
          onRemovePart={onRemovePart}
        />
      ) : (
        <ResponsiveGrid
          cols={{ default: 1, md: 2, lg: 3 }}
          gap="md"
        >
          {jobLines.map((jobLine) => (
            <JobLineCard 
              key={jobLine.id} 
              jobLine={jobLine}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddParts={onAddParts}
              onRemovePart={onRemovePart}
              isEditMode={isEditMode}
            />
          ))}
        </ResponsiveGrid>
      )}

      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Labor Summary */}
          {(totalHours > 0 || totalAmount > 0) && (
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Labor Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm text-muted-foreground">Total Labor Time</div>
                      <div className="font-semibold">{totalHours.toFixed(1)} hours</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-sm text-muted-foreground">Total Labor Cost</div>
                      <div className="font-semibold">${totalAmount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parts Summary */}
          <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parts Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {partsCalculations.totalParts > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm text-muted-foreground"># of Parts</div>
                        <div className="font-semibold">{partsCalculations.totalParts}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Parts Cost</div>
                        <div className="font-semibold">${partsCalculations.totalPartsCost.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Parts Sell Price</div>
                        <div className="font-semibold">${partsCalculations.totalPartsSellPrice.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Parts Margin</div>
                        <div className="font-semibold">
                          ${partsMargin.toFixed(2)} ({partsMarginPercent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No parts added to job lines yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add parts to individual job lines to see totals here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
