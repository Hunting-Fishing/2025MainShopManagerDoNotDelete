
// Available roles and departments
export const availableRoles = ["Owner", "Administrator", "Technician", "Customer Service"];

// Map display roles to database enum values
export const roleValueMapping: Record<string, string> = {
  "Owner": "owner",
  "Administrator": "admin", 
  "Technician": "technician",
  "Customer Service": "reception"
};

export const availableDepartments = [
  "Management", 
  "Executive",
  "Field Service", 
  "Administration", 
  "Customer Support",
  "Operations",
  "Shop Floor",
  "Service Bay",
  "Mobile Service",
  "Diagnostics",
  "Front Office",
  "Service Desk",
  "Reception",
  "General",
  "Other"
];
