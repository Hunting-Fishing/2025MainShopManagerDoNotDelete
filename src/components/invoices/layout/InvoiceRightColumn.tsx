
import React from "react";
import { InvoiceSummary } from "@/components/invoices/InvoiceSummary";
import { StaffAssignment } from "@/components/invoices/StaffAssignment";
import { StaffMember } from "@/types/invoice";

interface InvoiceRightColumnProps {
  createdBy: string;
  assignedStaff: string[];
  staffMembers: StaffMember[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  showStaffDialog: boolean;
  setShowStaffDialog: (show: boolean) => void;
  onCreatedByChange: (value: string) => void;
  onAddStaffMember: (staffMember: StaffMember) => void;
  onRemoveStaffMember: (name: string) => void;
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
  onRemoveStaffMember,
}: InvoiceRightColumnProps) {
  return (
    <div className="space-y-6">
      {/* Invoice Summary */}
      <InvoiceSummary
        subtotal={subtotal}
        taxRate={taxRate}
        tax={tax}
        total={total}
      />
      
      {/* Staff Assignment */}
      <StaffAssignment
        createdBy={createdBy}
        assignedStaff={assignedStaff}
        staffMembers={staffMembers}
        showStaffDialog={showStaffDialog}
        setShowStaffDialog={setShowStaffDialog}
        onCreatedByChange={onCreatedByChange}
        onAddStaffMember={onAddStaffMember}
        onRemoveStaffMember={onRemoveStaffMember}
      />
    </div>
  );
}
