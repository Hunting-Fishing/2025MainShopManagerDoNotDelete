
// Define job titles mapped to each role
export const roleJobTitleMap: Record<string, string[]> = {
  "Owner": [
    "Business Owner",
    "CEO",
    "President",
    "Managing Director"
  ],
  "Administrator": [
    "Office Manager",
    "Administrative Assistant", 
    "Operations Manager",
    "Shop Manager",
    "General Manager"
  ],
  "Manager": [
    "Service Manager",
    "Department Manager",
    "Team Lead",
    "Supervisor"
  ],
  "Technician": [
    "Apprentice 1",
    "Apprentice 2",
    "Apprentice 3",
    "Apprentice 4",
    "Technician",
    "Senior Technician",
    "Lead Technician",
    "Mobile Technician",
    "Shop Foreman",
    "Master Technician"
  ],
  "Service Advisor": [
    "Service Writer",
    "Service Consultant", 
    "Customer Service Representative",
    "Service Advisor"
  ],
  "Parts Manager": [
    "Parts Specialist",
    "Inventory Manager",
    "Parts Coordinator"
  ],
  "Reception": [
    "Front Desk Associate",
    "Receptionist",
    "Office Administrator",
    "Customer Care Representative"
  ],
  "Other Staff": [
    "General Staff",
    "Assistant",
    "Specialist",
    "Intern",
    "Contractor"
  ]
};

// Default job titles when no role is selected
export const defaultJobTitles = [
  "General Staff",
  "Assistant",
  "Specialist",
  "Coordinator"
];
