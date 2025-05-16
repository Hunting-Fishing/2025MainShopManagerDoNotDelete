import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StaffSelector } from "@/components/invoices/StaffSelector";
import { StaffMember } from "@/types/invoice";

interface InvoiceRightColumnProps {
  invoiceDescription: string;
  setInvoiceDescription: (description: string) => void;
  invoiceNotes: string;
  setInvoiceNotes: (notes: string) => void;
  staffMembers: StaffMember[];
  showStaffDialog: boolean;
  setShowStaffDialog: (show: boolean) => void;
  handleAddStaffMember: (staff: StaffMember) => void;
  handleRemoveStaffMember: (staffId: string) => void;
}

export function InvoiceRightColumn({
  invoiceDescription,
  setInvoiceDescription,
  invoiceNotes,
  setInvoiceNotes,
  staffMembers,
  showStaffDialog,
  setShowStaffDialog,
  handleAddStaffMember,
  handleRemoveStaffMember
}: InvoiceRightColumnProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Additional Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the invoice"
            value={invoiceDescription}
            onChange={(e) => setInvoiceDescription(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes or information"
            value={invoiceNotes}
            onChange={(e) => setInvoiceNotes(e.target.value)}
          />
        </div>

        {/* Assigned Staff */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Assigned Staff</Label>
            <Button variant="outline" size="sm" onClick={() => setShowStaffDialog(true)}>
              Add Staff
            </Button>
          </div>
          <Separator />
          {staffMembers.length === 0 ? (
            <p className="text-sm text-slate-500">No staff assigned to this invoice.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {staffMembers.map((staff) => (
                <div key={staff.id} className="flex items-center space-x-2 border rounded-full px-3 py-1 text-sm">
                  <span>{staff.name}</span>
                  <button onClick={() => handleRemoveStaffMember(staff.id)} className="hover:text-red-500">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Selector Dialog */}
        <StaffSelector
          isOpen={showStaffDialog}
          staffMembers={staffMembers}
          onClose={() => setShowStaffDialog(false)}
          onAddStaffMember={handleAddStaffMember}
        />
      </CardContent>
    </Card>
  );
}
