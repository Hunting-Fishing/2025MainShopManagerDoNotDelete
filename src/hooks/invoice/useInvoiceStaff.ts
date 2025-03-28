
import { useState } from "react";
import { StaffMember } from "@/types/invoice";

export function useInvoiceStaff(initialStaff: string[] = []) {
  const [assignedStaff, setAssignedStaff] = useState<string[]>(initialStaff);

  // Handle adding staff member
  const handleAddStaffMember = (staffMember: StaffMember) => {
    if (!assignedStaff.includes(staffMember.name)) {
      setAssignedStaff([...assignedStaff, staffMember.name]);
    }
  };

  // Handle removing staff member
  const handleRemoveStaffMember = (name: string) => {
    setAssignedStaff(assignedStaff.filter(staff => staff !== name));
  };

  return {
    assignedStaff,
    setAssignedStaff,
    handleAddStaffMember,
    handleRemoveStaffMember
  };
}
