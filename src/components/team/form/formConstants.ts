
// Available roles and departments
export const availableRoles = ["Owner", "Administrator", "Technician", "Service Advisor", "Manager", "Parts Manager", "Reception", "Other Staff"];

// Map display roles to database enum values
export const roleValueMapping: Record<string, string> = {
  "Owner": "owner",
  "Administrator": "admin", 
  "Manager": "manager",
  "Parts Manager": "parts_manager",
  "Service Advisor": "service_advisor",
  "Technician": "technician",
  "Reception": "reception",
  "Other Staff": "other_staff",
  "Customer Service": "reception" // Alias for backward compatibility
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
