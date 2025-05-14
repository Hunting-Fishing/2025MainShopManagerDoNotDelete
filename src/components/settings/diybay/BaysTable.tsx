
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
import { Check, X, Save, FileEdit } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  onRateChange = () => {},
}) => {
  const [editingCell, setEditingCell] = useState<{
    bayId: string;
    field: 'daily_rate' | 'weekly_rate' | 'monthly_rate';
    value: number;
    originalValue: number;
  } | null>(null);
  
  const [saveStatus, setSaveStatus] = useState<{
    bayId: string;
    field: string;
    status: 'saving' | 'success' | 'error';
  } | null>(null);

  const handleCellClick = (bay: Bay, field: 'daily_rate' | 'weekly_rate' | 'monthly_rate') => {
    setEditingCell({
      bayId: bay.id,
      field,
      value: bay[field] || 0,
      originalValue: bay[field] || 0
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    
    const bay = bays.find(b => b.id === editingCell.bayId);
    if (!bay) return;
    
    try {
      setSaveStatus({
        bayId: editingCell.bayId,
        field: editingCell.field,
        status: 'saving'
      });
      
      await onRateChange(bay, editingCell.field, editingCell.value);
      
      setSaveStatus({
        bayId: editingCell.bayId,
        field: editingCell.field,
        status: 'success'
      });
      
      // Clear success status after a moment
      setTimeout(() => {
        if (saveStatus?.status === 'success') {
          setSaveStatus(null);
        }
      }, 1500);
      
      setEditingCell(null);
    } catch (error) {
      console.error('Error saving rate:', error);
      setSaveStatus({
        bayId: editingCell.bayId,
        field: editingCell.field,
        status: 'error'
      });
      
      // Clear error status after a moment
      setTimeout(() => {
        if (saveStatus?.status === 'error') {
          setSaveStatus(null);
        }
      }, 3000);
    }
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
    const isSaving = saveStatus?.bayId === bay.id && saveStatus?.field === field && saveStatus?.status === 'saving';
    const isSuccess = saveStatus?.bayId === bay.id && saveStatus?.field === field && saveStatus?.status === 'success';
    const isError = saveStatus?.bayId === bay.id && saveStatus?.field === field && saveStatus?.status === 'error';
    
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
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
            </button>
            <button 
              onClick={handleCancelEdit}
              className="p-1 rounded-full text-red-600 hover:bg-red-100"
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }
    
    if (isSaving) {
      return (
        <div className="flex items-center justify-between">
          <span className="text-gray-500">{formatCurrency(value || 0)}</span>
          <span className="text-blue-600 animate-pulse ml-2 text-xs">Saving...</span>
        </div>
      );
    }
    
    if (isSuccess) {
      return (
        <div className="flex items-center justify-between">
          <span>{formatCurrency(value || 0)}</span>
          <Check className="h-4 w-4 text-green-600 ml-2" />
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="flex items-center justify-between">
          <span>{formatCurrency(value || 0)}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <X className="h-4 w-4 text-red-600 ml-2" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Failed to save. Click to try again.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors flex justify-between items-center group"
              onClick={() => handleCellClick(bay, field)}
            >
              <span>{value ? formatCurrency(value) : "N/A"}</span>
              <FileEdit className="h-3.5 w-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to edit {field.replace('_rate', '')} rate</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
              <TableRow key={bay.id} className={bay.is_active ? "" : "bg-gray-50"}>
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
