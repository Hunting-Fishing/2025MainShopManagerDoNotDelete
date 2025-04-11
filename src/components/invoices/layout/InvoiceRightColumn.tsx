import { StaffMember } from "@/types/invoice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaffSelector } from "../StaffSelector";
import { formatCurrency } from "@/lib/utils";
import { Plus, X } from "lucide-react";

export interface InvoiceRightColumnProps {
  createdBy: string;
  assignedStaff: StaffMember[];
  staffMembers: StaffMember[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  showStaffDialog: boolean;
  setShowStaffDialog: (show: boolean) => void;
  onCreatedByChange: (value: string) => void;
  onAddStaffMember: (staff: StaffMember) => void;
  onRemoveStaffMember: (staffId: string) => void;
}

export function InvoiceRightColumn({
  createdBy,
  assignedStaff,
  staffMembers,
  subtotal,
  taxRate,
  tax,
  total,
  showStaffDialog,
  setShowStaffDialog,
  onCreatedByChange,
  onAddStaffMember,
  onRemoveStaffMember
}: InvoiceRightColumnProps) {
  return (
    <div className="col-span-12 lg:col-span-4 space-y-6">
      <div className="bg-white shadow rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Add to Invoice</h3>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowWorkOrderDialog(true)}
          >
            <Box className="mr-2 h-4 w-4" />
            Select Work Order
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowInventoryDialog(true)}
          >
            <Box className="mr-2 h-4 w-4" />
            Add Inventory Items
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Assigned Staff</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStaffDialog(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {assignedStaff.length === 0 ? (
          <p className="text-muted-foreground text-sm">No staff members assigned</p>
        ) : (
          <div className="space-y-2">
            {assignedStaff.map((staffMember) => (
              <div
                key={staffMember.id}
                className="flex items-center justify-between bg-slate-50 p-2 rounded"
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">{staffMember.name}</p>
                    <p className="text-xs text-muted-foreground">{staffMember.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStaffMember(staffMember.id)}
                >
                  <span className="sr-only">Remove</span>
                  <span aria-hidden="true">&times;</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
