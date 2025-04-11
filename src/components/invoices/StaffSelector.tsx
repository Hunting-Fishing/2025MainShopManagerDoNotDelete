
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StaffMember } from "@/types/invoice";
import { Avatar } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface StaffSelectorProps {
  open: boolean;
  staffMembers: StaffMember[];
  onClose: () => void;
  onSelect: (member: StaffMember) => void;
}

export function StaffSelector({ open, staffMembers, onClose, onSelect }: StaffSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Staff Member</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-2 mt-2 max-h-[350px] overflow-y-auto">
          {staffMembers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No staff members available
            </div>
          ) : (
            staffMembers.map((member) => (
              <Button
                key={member.id}
                variant="outline"
                className="flex items-center justify-start px-3 py-6"
                onClick={() => {
                  onSelect(member);
                  onClose();
                }}
              >
                <Avatar className="h-8 w-8 mr-3 bg-slate-100">
                  <User className="h-4 w-4" />
                </Avatar>
                <div className="text-left">
                  <p className="font-medium">{member.name}</p>
                  {member.role && <p className="text-xs text-muted-foreground">{member.role}</p>}
                </div>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
