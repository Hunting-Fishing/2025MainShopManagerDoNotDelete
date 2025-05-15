
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Bay } from "@/services/diybay/diybayService";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, History, Loader2, GripVertical, MoreHorizontal } from "lucide-react";
import { EditableCell } from "./EditableCell";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface BaysTableProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onRateChange?: (bay: Bay, field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<boolean>;
  isSaving?: boolean;
}

export const BaysTable: React.FC<BaysTableProps> = ({
  bays,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  onRateChange,
  isSaving = false,
}) => {
  const handleStatusChange = async (bay: Bay, checked: boolean) => {
    await onStatusChange(bay, checked);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead className="w-1/6">Bay Name</TableHead>
            <TableHead className="w-1/6">Location</TableHead>
            <TableHead className="w-36 text-right">Hourly Rate</TableHead>
            <TableHead className="w-36 text-right">Daily Rate</TableHead>
            <TableHead className="w-36 text-right">Weekly Rate</TableHead>
            <TableHead className="w-36 text-right">Monthly Rate</TableHead>
            <TableHead className="w-28 text-center">Status</TableHead>
            <TableHead className="w-48 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bays.map((bay, index) => (
            <TableRow key={bay.id} className={bay.is_active ? "" : "bg-gray-50"}>
              <TableCell className="font-medium text-center">
                <div className="flex items-center justify-center space-x-2">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                  <span>{index + 1}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => onEditClick(bay)}>
                        Edit Bay
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleHistoryClick(bay)}>
                        Rate History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDeleteClick(bay)}
                        className="text-red-600 focus:text-red-600"
                      >
                        Delete Bay
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>

              <TableCell className={bay.is_active ? "" : "text-gray-500"}>
                {bay.bay_name}
              </TableCell>
              
              <TableCell className={bay.is_active ? "" : "text-gray-500"}>
                {bay.bay_location || "—"}
              </TableCell>
              
              {onRateChange ? (
                <>
                  <EditableCell 
                    value={bay.hourly_rate} 
                    onSave={(value) => onRateChange(bay, 'hourly_rate', value)} 
                    isCurrency={true}
                    disabled={!bay.is_active || isSaving}
                  />
                  <EditableCell 
                    value={bay.daily_rate || 0} 
                    onSave={(value) => onRateChange(bay, 'daily_rate', value)} 
                    isCurrency={true} 
                    disabled={!bay.is_active || isSaving}
                  />
                  <EditableCell 
                    value={bay.weekly_rate || 0} 
                    onSave={(value) => onRateChange(bay, 'weekly_rate', value)} 
                    isCurrency={true}
                    disabled={!bay.is_active || isSaving}
                  />
                  <EditableCell 
                    value={bay.monthly_rate || 0} 
                    onSave={(value) => onRateChange(bay, 'monthly_rate', value)} 
                    isCurrency={true}
                    disabled={!bay.is_active || isSaving}
                  />
                </>
              ) : (
                <>
                  <TableCell className="text-right">${bay.hourly_rate.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    ${bay.daily_rate ? bay.daily_rate.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell className="text-right">
                    ${bay.weekly_rate ? bay.weekly_rate.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell className="text-right">
                    ${bay.monthly_rate ? bay.monthly_rate.toFixed(2) : '0.00'}
                  </TableCell>
                </>
              )}
              
              <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <span className={bay.is_active ? "text-green-600" : "text-gray-400"}>
                    {bay.is_active ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={bay.is_active}
                    onCheckedChange={(checked) => handleStatusChange(bay, checked)}
                    disabled={isSaving}
                  />
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick(bay)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                    <span className="ml-1">Edit</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHistoryClick(bay)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
                    <span className="ml-1">History</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteClick(bay)}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="ml-1">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  async function handleHistoryClick(bay: Bay) {
    await onHistoryClick(bay);
  }
};

export default BaysTable;
