
import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Bay } from "@/services/diybay/diybayService";
import { Edit, History, Trash2, Check, X, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { EditableCell } from "./EditableCell";

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
  const formatRate = (rate: number | null) => {
    return rate !== null ? `$${rate.toFixed(2)}` : "-";
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Bay Name</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Hourly Rate</TableHead>
            <TableHead className="font-semibold">Daily Rate</TableHead>
            <TableHead className="font-semibold">Weekly Rate</TableHead>
            <TableHead className="font-semibold">Monthly Rate</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bays.map((bay, index) => (
            <TableRow key={bay.id} colorIndex={index}>
              <TableCell className="font-medium">{bay.bay_name}</TableCell>
              <TableCell>{bay.bay_location || "-"}</TableCell>
              
              {onRateChange ? (
                <>
                  <EditableCell
                    value={bay.hourly_rate}
                    onSave={async (value) => onRateChange(bay, 'hourly_rate', Number(value))}
                    isNumber
                    formatValue={formatRate}
                    disabled={isSaving}
                  />
                  <EditableCell
                    value={bay.daily_rate}
                    onSave={async (value) => onRateChange(bay, 'daily_rate', Number(value))}
                    isNumber
                    formatValue={formatRate}
                    disabled={isSaving}
                  />
                  <EditableCell
                    value={bay.weekly_rate}
                    onSave={async (value) => onRateChange(bay, 'weekly_rate', Number(value))}
                    isNumber
                    formatValue={formatRate}
                    disabled={isSaving}
                  />
                  <EditableCell
                    value={bay.monthly_rate}
                    onSave={async (value) => onRateChange(bay, 'monthly_rate', Number(value))}
                    isNumber
                    formatValue={formatRate}
                    disabled={isSaving}
                  />
                </>
              ) : (
                <>
                  <TableCell>{formatRate(bay.hourly_rate)}</TableCell>
                  <TableCell>{formatRate(bay.daily_rate)}</TableCell>
                  <TableCell>{formatRate(bay.weekly_rate)}</TableCell>
                  <TableCell>{formatRate(bay.monthly_rate)}</TableCell>
                </>
              )}
              
              <TableCell className="text-center">
                <Switch
                  checked={bay.is_active}
                  disabled={isSaving}
                  onCheckedChange={async (checked) => {
                    await onStatusChange(bay, checked);
                  }}
                />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <button
                  onClick={() => onEditClick(bay)}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-md p-1 text-blue-600 hover:bg-blue-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={async () => await onHistoryClick(bay)}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-md p-1 text-purple-600 hover:bg-purple-50"
                >
                  <History className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteClick(bay)}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-md p-1 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
