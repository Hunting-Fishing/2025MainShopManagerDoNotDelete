
import React from "react";
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

interface BaysTableProps {
  bays: Bay[];
  onStatusChange: (bay: Bay, isActive: boolean) => void;
  onEditClick: (bay: Bay) => void;
  onDeleteClick: (bay: Bay) => void;
  onHistoryClick: (bay: Bay) => void;
}

export const BaysTable: React.FC<BaysTableProps> = ({
  bays,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onHistoryClick,
}) => {
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
                  {bay.daily_rate ? formatCurrency(bay.daily_rate) : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {bay.weekly_rate ? formatCurrency(bay.weekly_rate) : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {bay.monthly_rate ? formatCurrency(bay.monthly_rate) : "N/A"}
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
                    <span className="text-sm">
                      {bay.is_active ? "Active" : "Inactive"}
                    </span>
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
