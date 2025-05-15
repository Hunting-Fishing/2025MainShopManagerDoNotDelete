
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Bay } from "@/services/diybay/diybayService";
import { BayList } from "./BayList";
import { BaysTable } from "./BaysTable";
import { CompactBayList } from "./CompactBayList";
import { ViewModeToggle } from "./ViewModeToggle";
import { BayViewMode } from "@/types/diybay";
import { Loader2, Plus, Printer, BarChart3, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { PrintPreviewDialog } from "./PrintPreviewDialog";
import { RateComparisonChart } from "./RateComparisonChart";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface BaySectionProps {
  bays: Bay[];
  viewMode: BayViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<BayViewMode>>;
  isLoading: boolean;
  isSaving: boolean;
  onAddBay: () => Promise<boolean>;
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onRateChange: (bay: Bay, field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<boolean>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onDragEnd?: (event: DragEndEvent) => void;
}

type SortField = 'bay_name' | 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate' | 'display_order';
type SortDirection = 'asc' | 'desc';

export const BaySection: React.FC<BaySectionProps> = ({
  bays,
  viewMode,
  setViewMode,
  isLoading,
  isSaving,
  onAddBay,
  onStatusChange,
  onRateChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  onDragEnd,
}) => {
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showInactiveBays, setShowInactiveBays] = useState(true);
  const [sortField, setSortField] = useState<SortField>('display_order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Set up drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter and sort bays
  const displayBays = useMemo(() => {
    let filteredBays = [...bays];
    
    // Filter inactive bays if needed
    if (!showInactiveBays) {
      filteredBays = filteredBays.filter(bay => bay.is_active);
    }
    
    // Sort bays
    filteredBays.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle null values
      if (aValue === null) aValue = 0;
      if (bValue === null) bValue = 0;
      
      // Sort direction
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filteredBays;
  }, [bays, showInactiveBays, sortField, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  const handleBulkAction = (action: string) => {
    // Implement bulk actions here
    console.log(`Bulk action: ${action}`);
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Available Bays</CardTitle>
          <div className="flex items-center gap-3">
            <Button
              variant={showComparison ? "default" : "outline"}
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              className={`flex items-center gap-1 ${showComparison ? "bg-blue-600" : ""}`}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Compare
            </Button>
            
            <Button 
              onClick={() => setIsPrintPreviewOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              disabled={isLoading || bays.length === 0}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Show Inactive</span>
                    <Switch 
                      checked={showInactiveBays} 
                      onCheckedChange={setShowInactiveBays}
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleBulkAction('activate-all')}>
                  Activate All Bays
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleBulkAction('deactivate-all')}>
                  Deactivate All Bays
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-2">
              <Select value={sortField} onValueChange={(val) => setSortField(val as SortField)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bay_name">Bay Name</SelectItem>
                  <SelectItem value="hourly_rate">Hourly Rate</SelectItem>
                  <SelectItem value="daily_rate">Daily Rate</SelectItem>
                  <SelectItem value="weekly_rate">Weekly Rate</SelectItem>
                  <SelectItem value="monthly_rate">Monthly Rate</SelectItem>
                  <SelectItem value="display_order">Display Order</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSortDirection}
                title={sortDirection === 'asc' ? "Sort ascending" : "Sort descending"}
              >
                {sortDirection === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            
            <Button 
              onClick={onAddBay} 
              disabled={isSaving || isLoading}
              size="sm"
              className="flex items-center gap-1"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Add Bay
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {showComparison && (
          <div className="mb-6">
            <RateComparisonChart bays={displayBays} showInactive={showInactiveBays} />
          </div>
        )}
        
        <div id="bays-content">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : displayBays.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {showInactiveBays ? 
                "No bays have been added yet. Click the \"Add Bay\" button to create your first bay." :
                "No active bays found. Enable 'Show Inactive' to see all bays."
              }
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext 
                items={displayBays.map(bay => bay.id)} 
                strategy={verticalListSortingStrategy}
              >
                {viewMode === "table" ? (
                  <BaysTable 
                    bays={displayBays}
                    onStatusChange={onStatusChange}
                    onRateChange={onRateChange} 
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onHistoryClick={onHistoryClick}
                    isSaving={isSaving}
                  />
                ) : viewMode === "cards" ? (
                  <BayList 
                    bays={displayBays}
                    viewMode={viewMode}
                    onStatusChange={onStatusChange}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onHistoryClick={onHistoryClick}
                    isSaving={isSaving}
                    sortable={true}
                  />
                ) : (
                  <CompactBayList 
                    bays={displayBays}
                    onStatusChange={onStatusChange}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onHistoryClick={onHistoryClick}
                    isSaving={isSaving}
                    sortable={true}
                  />
                )}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </CardContent>

      {/* Print Preview Dialog */}
      <PrintPreviewDialog 
        isOpen={isPrintPreviewOpen}
        setIsOpen={setIsPrintPreviewOpen}
        bays={bays}
      />
    </Card>
  );
};
