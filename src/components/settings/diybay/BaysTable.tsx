
import React from "react";
import { Bay } from "@/services/diybay/diybayService";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, History, Loader2, GripVertical } from "lucide-react";
import { EditableCell } from "./EditableCell";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BaysTableProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onRateChange?: (bay: Bay, field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<boolean>;
  isSaving?: boolean;
}

// Row component that uses dnd-kit for sortable functionality
const SortableTableRow = ({
  bay, 
  onStatusChange, 
  onEditClick, 
  onDeleteClick, 
  onHistoryClick, 
  onRateChange,
  isSaving = false
}: {
  bay: Bay;
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onRateChange?: (bay: Bay, field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<boolean>;
  isSaving?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: bay.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f0f9ff' : undefined,
    zIndex: isDragging ? 10 : 1,
  };

  const handleStatusChange = async (checked: boolean) => {
    await onStatusChange(bay, checked);
  };

  // Determine row background based on bay status
  const rowBackground = bay.is_active 
    ? "bg-green-50 hover:bg-green-100"
    : "bg-red-50 hover:bg-red-100 opacity-75";

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      className={`${rowBackground} border-l-4 ${bay.is_active ? 'border-l-green-500' : 'border-l-red-500'} mb-2`}
    >
      <TableCell className="py-3">
        <div className="flex items-center">
          <div 
            {...attributes}
            {...listeners}
            className={`cursor-grab p-2 bg-blue-50 hover:bg-blue-100 rounded-md flex items-center justify-center ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Reorder bay"
          >
            <GripVertical size={20} className="text-blue-600" />
          </div>
        </div>
      </TableCell>
      
      <TableCell className="font-medium">{bay.bay_name}</TableCell>
      
      <TableCell>{bay.bay_location || "Standard"}</TableCell>
      
      <TableCell>
        {onRateChange ? (
          <EditableCell 
            value={bay.hourly_rate} 
            onChange={(value) => onRateChange(bay, 'hourly_rate', value)}
            prefix="$"
            disabled={isSaving}
          />
        ) : (
          `$${bay.hourly_rate?.toFixed(2)}`
        )}
      </TableCell>
      
      <TableCell>
        {onRateChange ? (
          <EditableCell 
            value={bay.daily_rate || 0} 
            onChange={(value) => onRateChange(bay, 'daily_rate', value)}
            prefix="$"
            disabled={isSaving}
          />
        ) : (
          `$${bay.daily_rate?.toFixed(2) || '0.00'}`
        )}
      </TableCell>
      
      <TableCell>
        {onRateChange ? (
          <EditableCell 
            value={bay.weekly_rate || 0} 
            onChange={(value) => onRateChange(bay, 'weekly_rate', value)}
            prefix="$"
            disabled={isSaving}
          />
        ) : (
          `$${bay.weekly_rate?.toFixed(2) || '0.00'}`
        )}
      </TableCell>
      
      <TableCell>
        {onRateChange ? (
          <EditableCell 
            value={bay.monthly_rate || 0} 
            onChange={(value) => onRateChange(bay, 'monthly_rate', value)}
            prefix="$"
            disabled={isSaving}
          />
        ) : (
          `$${bay.monthly_rate?.toFixed(2) || '0.00'}`
        )}
      </TableCell>
      
      <TableCell>
        <div className="flex justify-center">
          <Switch
            checked={bay.is_active}
            onCheckedChange={handleStatusChange}
            disabled={isSaving}
          />
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditClick(bay)}
            disabled={isSaving}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onHistoryClick(bay)}
            disabled={isSaving}
            className="text-purple-600 hover:bg-purple-50"
          >
            <History className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteClick(bay)}
            disabled={isSaving}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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
  isSaving = false
}) => {
  const sortable = true;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            {sortable && <TableHead className="w-16">
              <span className="flex items-center gap-1 text-sm font-medium">
                <div className="p-1 bg-blue-100 rounded-md inline-flex items-center">
                  <GripVertical size={16} className="text-blue-600" />
                </div>
                <span className="ml-1">Drag</span>
              </span>
            </TableHead>}
            <TableHead>Bay Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Hourly Rate</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Weekly Rate</TableHead>
            <TableHead>Monthly Rate</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bays.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No bays added yet. Click "Add Bay" to create your first bay.
              </TableCell>
            </TableRow>
          ) : (
            bays.map((bay) => (
              <SortableTableRow
                key={bay.id}
                bay={bay}
                onStatusChange={onStatusChange}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onHistoryClick={onHistoryClick}
                onRateChange={onRateChange}
                isSaving={isSaving}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BaysTable;
