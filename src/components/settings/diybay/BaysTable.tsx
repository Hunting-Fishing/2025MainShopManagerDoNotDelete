
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Bay } from "@/services/diybay/diybayService";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit2, Clock, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Input } from "@/components/ui/input";

interface BaysTableProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  onRateChange?: (bay: Bay, field: 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<void>;
}

interface EditableCell {
  bayId: string;
  field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate' | null;
}

export const BaysTable: React.FC<BaysTableProps> = ({
  bays,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  onRateChange
}) => {
  const [editingCell, setEditingCell] = useState<EditableCell>({ bayId: '', field: null });
  const [editValue, setEditValue] = useState<string>('');
  
  const handleCellClick = (bay: Bay, field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate') => {
    setEditingCell({ bayId: bay.id, field });
    setEditValue(bay[field]?.toString() || '0');
  };
  
  const handleBlur = async (bay: Bay) => {
    if (!editingCell.field) return;
    
    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) return;
    
    if (editingCell.field === 'hourly_rate') {
      // For hourly rate, use the full edit dialog as it affects other rates
      onEditClick(bay);
    } else if (onRateChange) {
      // For other rates, use the direct rate change handler
      await onRateChange(bay, editingCell.field, numValue);
    }
    
    setEditingCell({ bayId: '', field: null });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, bay: Bay) => {
    if (e.key === 'Enter') {
      handleBlur(bay);
    } else if (e.key === 'Escape') {
      setEditingCell({ bayId: '', field: null });
    }
  };

  return (
    <div className="rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-1/5 font-medium">Bay Name</TableHead>
            <TableHead className="w-1/6 font-medium">Location</TableHead>
            <TableHead className="w-1/6 text-center font-medium">Hourly Rate</TableHead>
            <TableHead className="w-1/6 text-center font-medium">Daily Rate</TableHead>
            <TableHead className="w-1/6 text-center font-medium">Weekly Rate</TableHead>
            <TableHead className="w-1/6 text-center font-medium">Monthly Rate</TableHead>
            <TableHead className="w-1/6 text-center font-medium">Status</TableHead>
            <TableHead className="w-1/6 text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bays.map((bay) => (
            <TableRow key={bay.id} className="hover:bg-slate-50">
              <TableCell className="font-medium">{bay.bay_name}</TableCell>
              <TableCell>{bay.bay_location || "—"}</TableCell>
              
              <TableCell 
                className="text-center cursor-pointer hover:bg-blue-50 transition-colors" 
                onClick={() => handleCellClick(bay, 'hourly_rate')}
              >
                {editingCell.bayId === bay.id && editingCell.field === 'hourly_rate' ? (
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleBlur(bay)}
                    onKeyDown={(e) => handleKeyDown(e, bay)}
                    autoFocus
                    className="h-8 text-center"
                  />
                ) : (
                  <span className="font-medium">{formatCurrency(bay.hourly_rate)}</span>
                )}
              </TableCell>
              
              <TableCell 
                className="text-center cursor-pointer hover:bg-blue-50 transition-colors" 
                onClick={() => handleCellClick(bay, 'daily_rate')}
              >
                {editingCell.bayId === bay.id && editingCell.field === 'daily_rate' ? (
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleBlur(bay)}
                    onKeyDown={(e) => handleKeyDown(e, bay)}
                    autoFocus
                    className="h-8 text-center"
                  />
                ) : (
                  bay.daily_rate ? formatCurrency(bay.daily_rate) : "—"
                )}
              </TableCell>
              
              <TableCell 
                className="text-center cursor-pointer hover:bg-blue-50 transition-colors" 
                onClick={() => handleCellClick(bay, 'weekly_rate')}
              >
                {editingCell.bayId === bay.id && editingCell.field === 'weekly_rate' ? (
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleBlur(bay)}
                    onKeyDown={(e) => handleKeyDown(e, bay)}
                    autoFocus
                    className="h-8 text-center"
                  />
                ) : (
                  bay.weekly_rate ? formatCurrency(bay.weekly_rate) : "—"
                )}
              </TableCell>
              
              <TableCell 
                className="text-center cursor-pointer hover:bg-blue-50 transition-colors" 
                onClick={() => handleCellClick(bay, 'monthly_rate')}
              >
                {editingCell.bayId === bay.id && editingCell.field === 'monthly_rate' ? (
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleBlur(bay)}
                    onKeyDown={(e) => handleKeyDown(e, bay)}
                    autoFocus
                    className="h-8 text-center"
                  />
                ) : (
                  bay.monthly_rate ? formatCurrency(bay.monthly_rate) : "—"
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex justify-center items-center gap-2">
                  <Switch
                    checked={bay.is_active}
                    onCheckedChange={(checked) => onStatusChange(bay, checked)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className="text-sm font-medium text-gray-500">
                    {bay.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onHistoryClick(bay)}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">View Rate History</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onEditClick(bay)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit Bay</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDeleteClick(bay)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete Bay</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
