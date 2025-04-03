
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
  "Customer Service": [
    "Service Advisor",
    "Customer Service Representative",
    "Service Writer",
    "Customer Care Specialist",
    "Front Desk Coordinator"
  ]
};

// Default job titles when no role is selected
export const defaultJobTitles = [
  "General Staff",
  "Assistant",
  "Specialist",
  "Coordinator"
];
