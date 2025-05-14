
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bay } from "@/services/diybay/diybayService";
import { formatCurrency } from "@/lib/formatters";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

interface BaysTableProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => void;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => void;
  onRateChange?: (bay: Bay, field: 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => void;
}

export const BaysTable: React.FC<BaysTableProps> = ({
  bays,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  onRateChange = (bay, field, value) => {},
}) => {
  const [editingCell, setEditingCell] = useState<{
    bayId: string;
    field: 'daily_rate' | 'weekly_rate' | 'monthly_rate';
    value: number;
  } | null>(null);

  const handleCellClick = (bay: Bay, field: 'daily_rate' | 'weekly_rate' | 'monthly_rate') => {
    setEditingCell({
      bayId: bay.id,
      field,
      value: bay[field] || 0,
    });
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    const bay = bays.find(b => b.id === editingCell.bayId);
    if (!bay) return;
    
    onRateChange(bay, editingCell.field, editingCell.value);
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCell) return;
    
    setEditingCell({
      ...editingCell,
      value: parseFloat(e.target.value) || 0,
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const renderRateCell = (bay: Bay, field: 'daily_rate' | 'weekly_rate' | 'monthly_rate') => {
    const isEditing = editingCell?.bayId === bay.id && editingCell?.field === field;
    const value = bay[field];
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={editingCell.value}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="w-24 h-8 text-right"
            autoFocus
          />
          <div className="flex space-x-1">
            <button 
              onClick={handleSaveEdit}
              className="p-1 rounded-full text-green-600 hover:bg-green-100"
            >
              <Check className="h-4 w-4" />
            </button>
            <button 
              onClick={handleCancelEdit}
              className="p-1 rounded-full text-red-600 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
        onClick={() => handleCellClick(bay, field)}
      >
        {value ? formatCurrency(value) : "N/A"}
      </div>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bay Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Hourly Rate</TableHead>
            <TableHead className="text-right">Daily Rate</TableHead>
            <TableHead className="text-right">Weekly Rate</TableHead>
            <TableHead className="text-right">Monthly Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bays.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No bays found. Add your first bay to get started.
              </TableCell>
            </TableRow>
          ) : (
            bays.map((bay) => (
              <TableRow key={bay.id}>
                <TableCell className="font-medium">{bay.bay_name}</TableCell>
                <TableCell>{bay.bay_location || "N/A"}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(bay.hourly_rate)}
                </TableCell>
                <TableCell className="text-right">
                  {renderRateCell(bay, 'daily_rate')}
                </TableCell>
                <TableCell className="text-right">
                  {renderRateCell(bay, 'weekly_rate')}
                </TableCell>
                <TableCell className="text-right">
                  {renderRateCell(bay, 'monthly_rate')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={bay.is_active}
                      onCheckedChange={(checked) =>
                        onStatusChange(bay, checked)
                      }
                      aria-label="Toggle bay status"
                    />
                    <Badge 
                      variant={bay.is_active ? "success" : "danger"}
                      className="text-xs font-medium"
                    >
                      {bay.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onHistoryClick(bay)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      History
                    </button>
                    <button
                      onClick={() => onEditClick(bay)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteClick(bay)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
