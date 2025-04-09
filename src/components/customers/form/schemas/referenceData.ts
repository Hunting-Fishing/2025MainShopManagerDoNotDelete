
// This file contains reference data for the customer form components

// Status options for customers
export const customerStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "new", label: "New" },
  { value: "lead", label: "Lead" },
  { value: "archived", label: "Archived" }
];

// Communication preference options
export const communicationPreferenceOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text" },
  { value: "mail", label: "Mail" },
  { value: "none", label: "No Contact" }
];

// Referral source options
export const referralSourceOptions = [
  { value: "online_search", label: "Online Search" },
  { value: "social_media", label: "Social Media" },
  { value: "friend_family", label: "Friend or Family" },
  { value: "advertisement", label: "Advertisement" },
  { value: "other", label: "Other" }
];

// Business type options
export const businessTypeOptions = [
  { value: "sole_proprietor", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
  { value: "non_profit", label: "Non-Profit" }
];

// Industry options for business customers
export const industryOptions = [
  { value: "construction", label: "Construction" },
  { value: "transportation", label: "Transportation" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" }
];

// Payment method options
export const paymentMethodOptions = [
  { value: "credit_card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "ach", label: "ACH/Bank Transfer" },
  { value: "invoice", label: "Invoice" }
];

// Credit terms options
export const creditTermsOptions = [
  { value: "none", label: "None" },
  { value: "net_15", label: "Net 15" },
  { value: "net_30", label: "Net 30" },
  { value: "net_45", label: "Net 45" },
  { value: "net_60", label: "Net 60" }
];

// Empty predefined tags since we're using database tags now
export const predefinedTags = [];

// Export variables with names matching imports in CustomerFormSchema.ts
export const paymentMethods = paymentMethodOptions;
export const businessTypes = businessTypeOptions;
export const businessIndustries = industryOptions;
export const serviceTypes = [
  { value: "maintenance", label: "Regular Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "emergency", label: "Emergency Service" },
  { value: "inspection", label: "Inspection" },
  { value: "upgrade", label: "Upgrade/Modification" }
];
