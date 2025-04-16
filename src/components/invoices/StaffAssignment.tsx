
import React from "react";
import { X, Users, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface StaffAssignmentProps {
  createdBy: string;
  assignedStaff: string[];
  staffMembers: StaffMember[];
  showStaffDialog: boolean;
  setShowStaffDialog: (show: boolean) => void;
  onCreatedByChange: (value: string) => void;
  onAddStaffMember: (staff: StaffMember) => void;
  onRemoveStaffMember: (name: string) => void;
}

export function StaffAssignment({
  createdBy,
  assignedStaff,
  staffMembers,
  showStaffDialog,
  setShowStaffDialog,
  onCreatedByChange,
  onAddStaffMember,
  onRemoveStaffMember,
}: StaffAssignmentProps) {
  // Check if there are actually any staff members available
  const hasStaffMembers = staffMembers && staffMembers.length > 0;
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Staff</h2>
        <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Select Staff Member</DialogTitle>
              <DialogDescription>
                Choose staff members involved in this invoice.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="space-y-3 mt-2">
                {hasStaffMembers ? (
                  staffMembers.map((staff) => (
                    <div 
                      key={staff.id} 
                      className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      onClick={() => onAddStaffMember(staff)}
                    >
                      <div>
                        <div className="font-medium">{staff.name}</div>
                        <div className="text-sm text-slate-500">{staff.role}</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <div className="mb-2">No staff members available</div>
                    <p className="text-sm">You need to create team members first.</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Creator */}
      <div className="mb-4">
        <Label htmlFor="creator">Created By</Label>
        <Select 
          value={createdBy}
          onValueChange={onCreatedByChange}
        >
          <SelectTrigger id="creator">
            <SelectValue placeholder="Select creator" />
          </SelectTrigger>
          <SelectContent>
            {hasStaffMembers ? (
              staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.name}>
                  {staff.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>No staff members available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Assigned staff */}
      <Label className="mb-2 block">Assigned Staff</Label>
      {assignedStaff.length > 0 ? (
        <div className="space-y-2">
          {assignedStaff.map((name) => (
            <div key={name} className="flex justify-between items-center p-2 rounded bg-slate-50">
              <span>{name}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-red-500 hover:text-red-700"
                onClick={() => onRemoveStaffMember(name)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 border border-dashed rounded-md text-center text-slate-500">
          No staff members assigned
        </div>
      )}
    </div>
  );
}
