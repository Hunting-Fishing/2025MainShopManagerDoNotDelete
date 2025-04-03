
// Default shops array
export const shops = [
  { id: "default-shop", name: "Main Location" }
];

// Relationship types for household members
export const relationshipTypes = [
  { id: "primary", label: "Primary Contact" },
  { id: "spouse", label: "Spouse/Partner" },
  { id: "child", label: "Child" },
  { id: "parent", label: "Parent" },
  { id: "relative", label: "Other Relative" },
  { id: "roommate", label: "Roommate" },
  { id: "other", label: "Other" }
];

// Predefined tags for customer tagging
export const predefinedTags = [
  { id: "vip", label: "VIP", color: "bg-purple-500" },
  { id: "new", label: "New Customer", color: "bg-green-500" },
  { id: "repeat", label: "Repeat Customer", color: "bg-blue-500" },
  { id: "credit-hold", label: "Credit Hold", color: "bg-red-500" },
  { id: "priority", label: "Priority", color: "bg-orange-500" },
  { id: "warranty", label: "Under Warranty", color: "bg-teal-500" },
  { id: "commercial", label: "Commercial", color: "bg-slate-500" },
  { id: "residential", label: "Residential", color: "bg-amber-500" },
  { id: "online", label: "Online Booking", color: "bg-cyan-500" },
  { id: "referred", label: "Referred", color: "bg-pink-500" }
];

// Customer segments
export const predefinedSegments = [
  { id: "high-value", label: "High Value", color: "bg-emerald-500", description: "Customers with high lifetime value" },
  { id: "loyal", label: "Loyal Customer", color: "bg-blue-500", description: "Regular repeat customers" },
  { id: "new", label: "New Customer", color: "bg-green-500", description: "Customers added in the last 30 days" },
  { id: "at-risk", label: "At Risk", color: "bg-red-500", description: "Customers who may not return" },
  { id: "seasonal", label: "Seasonal", color: "bg-amber-500", description: "Customers who visit during specific seasons" },
  { id: "infrequent", label: "Infrequent", color: "bg-gray-500", description: "Customers who visit less than once per year" },
  { id: "commercial", label: "Commercial", color: "bg-slate-500", description: "Business customers" },
  { id: "promotional", label: "Promotional", color: "bg-purple-500", description: "Customers who respond to promotions" }
];
