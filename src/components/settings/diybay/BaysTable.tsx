
import React from "react";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { Bay } from "@/services/diybay/diybayService";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { EditableCell } from "@/components/settings/diybay/EditableCell";
import { formatCurrency } from "@/lib/formatters";
import { MoreHorizontal, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BaysTableProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onRateChange?: (bay: Bay, field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<boolean>;
  isSaving: boolean;
  sortable?: boolean;
}

interface BayRowProps {
  bay: Bay;
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onRateChange?: (bay: Bay, field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<boolean>;
  isSaving: boolean;
  sortable?: boolean;
}

const BayRow: React.FC<BayRowProps> = ({
  bay,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  onRateChange,
  isSaving,
  sortable = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: bay.id,
    disabled: !sortable || isSaving
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative' as 'relative'
  };

  const handleStatusChange = async () => {
    await onStatusChange(bay, !bay.is_active);
  };

  const handleRateChange = async (field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: string) => {
    if (!onRateChange) return false;
    // Convert string to number before passing to onRateChange
    return await onRateChange(bay, field, Number(value));
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-muted/50" : ""}
    >
      {sortable && (
        <TableCell className="w-10">
          <div className="flex items-center gap-2">
            <div 
              {...attributes}
              {...listeners}
              className={`cursor-grab p-1 hover:bg-gray-100 rounded ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Reorder bay"
            >
              <GripVertical size={20} className="text-gray-500" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditClick(bay)}>
                  Edit Bay
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onHistoryClick(bay)}>
                  View Rate History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteClick(bay)}>
                  Delete Bay
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      )}
      <TableCell>{bay.bay_name}</TableCell>
      <TableCell>{bay.bay_type}</TableCell>
      <EditableCell
        value={bay.hourly_rate}
        onSave={(value: string) => handleRateChange('hourly_rate', value)}
        isNumber={true}
        formatValue={(val) => val ? formatCurrency(val) : ''}
        disabled={isSaving}
      />
      <EditableCell
        value={bay.daily_rate}
        onSave={(value: string) => handleRateChange('daily_rate', value)}
        isNumber={true}
        formatValue={(val) => val ? formatCurrency(val) : ''}
        disabled={isSaving}
      />
      <EditableCell
        value={bay.weekly_rate}
        onSave={(value: string) => handleRateChange('weekly_rate', value)}
        isNumber={true}
        formatValue={(val) => val ? formatCurrency(val) : ''}
        disabled={isSaving}
      />
      <EditableCell
        value={bay.monthly_rate}
        onSave={(value: string) => handleRateChange('monthly_rate', value)}
        isNumber={true}
        formatValue={(val) => val ? formatCurrency(val) : ''}
        disabled={isSaving}
      />
      <TableCell className="text-right">
        <Switch
          checked={bay.is_active}
          onCheckedChange={handleStatusChange}
          disabled={isSaving}
        />
      </TableCell>
    </TableRow>
  );
};

const BaysTable: React.FC<BaysTableProps> = ({
  bays,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  onRateChange,
  isSaving,
  sortable = false
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {sortable && <TableHead className="w-10">Order</TableHead>}
            <TableHead>Bay Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Hourly Rate</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Weekly Rate</TableHead>
            <TableHead>Monthly Rate</TableHead>
            <TableHead className="text-right">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bays.length === 0 ? (
            <TableRow>
              <TableCell colSpan={sortable ? 8 : 7} className="text-center py-8">
                No bays found.
              </TableCell>
            </TableRow>
          ) : (
            bays.map((bay) => (
              <BayRow
                key={bay.id}
                bay={bay}
                onStatusChange={onStatusChange}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onHistoryClick={onHistoryClick}
                onRateChange={onRateChange}
                isSaving={isSaving}
                sortable={sortable}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BaysTable;
