
import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/utils/rateCalculations";
import { Bay } from "@/services/diybay/diybayService";
import { Switch } from "@/components/ui/switch";
import { Edit, History, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EditableCellProps {
  value: number | null;
  onSave: (value: number) => Promise<boolean>;
  formatValue?: (value: number | null) => string;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, formatValue = (val) => val?.toString() || "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState<string>(value?.toString() || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditedValue(value?.toString() || "");
    setSaveError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedValue(e.target.value);
  };

  const handleSave = async () => {
    if (editedValue.trim() === "") {
      setIsEditing(false);
      return;
    }

    const numericValue = parseFloat(editedValue);
    if (isNaN(numericValue)) {
      setSaveError("Please enter a valid number");
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(numericValue);
      if (success) {
        setIsEditing(false);
        setSaveError(null);
        toast({
          title: "Rate updated",
          description: "The rate has been saved successfully.",
        });
      } else {
        setSaveError("Failed to save changes");
        toast({
          title: "Error",
          description: "Failed to save rate changes. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving rate:", error);
      setSaveError("An error occurred");
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setSaveError(null);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <div className="min-w-[80px] relative group">
      {isEditing ? (
        <div className="flex flex-col">
          <input
            type="text"
            value={editedValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              saveError ? "border-red-500" : "border-gray-300"
            }`}
            autoFocus
          />
          {saveError && <div className="text-xs text-red-500 mt-1">{saveError}</div>}
          {isSaving && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      ) : (
        <div
          className="cursor-pointer py-1 px-2 rounded hover:bg-blue-50 flex items-center justify-between"
          onDoubleClick={handleDoubleClick}
        >
          <span>{formatValue(value)}</span>
          <Edit className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 ml-1" />
        </div>
      )}
    </div>
  );
};

interface BaysTableProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => Promise<void>;
  onRateChange: (bay: Bay, field: 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'monthly_rate', value: number) => Promise<boolean>;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => Promise<void>;
  isSaving: boolean;
}

export const BaysTable: React.FC<BaysTableProps> = ({
  bays,
  onStatusChange,
  onRateChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
  isSaving,
}) => {
  return (
    <div className="rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[200px]">Bay Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Hourly Rate</TableHead>
            <TableHead className="text-right">Daily Rate</TableHead>
            <TableHead className="text-right">Weekly Rate</TableHead>
            <TableHead className="text-right">Monthly Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bays.map((bay) => (
            <TableRow key={bay.id}>
              <TableCell className="font-medium">{bay.bay_name}</TableCell>
              <TableCell>{bay.bay_location || "—"}</TableCell>
              <TableCell className="text-right">
                <EditableCell
                  value={bay.hourly_rate}
                  onSave={async (value) => await onRateChange(bay, "hourly_rate", value)}
                  formatValue={(val) => formatCurrency(val || 0)}
                />
              </TableCell>
              <TableCell className="text-right">
                <EditableCell
                  value={bay.daily_rate}
                  onSave={async (value) => await onRateChange(bay, "daily_rate", value)}
                  formatValue={(val) => formatCurrency(val || 0)}
                />
              </TableCell>
              <TableCell className="text-right">
                <EditableCell
                  value={bay.weekly_rate}
                  onSave={async (value) => await onRateChange(bay, "weekly_rate", value)}
                  formatValue={(val) => formatCurrency(val || 0)}
                />
              </TableCell>
              <TableCell className="text-right">
                <EditableCell
                  value={bay.monthly_rate}
                  onSave={async (value) => await onRateChange(bay, "monthly_rate", value)}
                  formatValue={(val) => formatCurrency(val || 0)}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={bay.is_active}
                  onCheckedChange={(checked) => onStatusChange(bay, checked)}
                  disabled={isSaving}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditClick(bay)}
                    disabled={isSaving}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onHistoryClick(bay)}
                    disabled={isSaving}
                  >
                    <History className="h-4 w-4" />
                    <span className="sr-only">History</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClick(bay)}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
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
