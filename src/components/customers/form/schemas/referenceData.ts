
import { z } from "zod";

/**
 * Predefined tag options for customer tagging
 * Each tag has an id (used as value), a display label, and a color class
 */
export const predefinedTags = [
  { id: "loyal", label: "Loyal Customer", color: "bg-emerald-600" },
  { id: "vip", label: "VIP", color: "bg-purple-600" },
  { id: "new", label: "New Customer", color: "bg-blue-600" },
  { id: "commercial", label: "Commercial", color: "bg-orange-600" },
  { id: "residential", label: "Residential", color: "bg-sky-600" },
  { id: "fleet", label: "Fleet", color: "bg-amber-600" },
  { id: "warranty", label: "Under Warranty", color: "bg-green-600" },
  { id: "contract", label: "Service Contract", color: "bg-indigo-600" },
  { id: "priority", label: "Priority Service", color: "bg-red-600" },
  { id: "late-payment", label: "Late Payment", color: "bg-rose-600" },
  { id: "referral", label: "Referral Source", color: "bg-teal-600" },
  { id: "seasonal", label: "Seasonal", color: "bg-cyan-600" },
  { id: "inactive", label: "Inactive", color: "bg-gray-600" },
  { id: "at-risk", label: "At Risk", color: "bg-red-700" },
  { id: "discount", label: "Discount Program", color: "bg-violet-600" },
];

/**
 * Payment method options
 */
export const paymentMethods = [
  { value: "credit", label: "Credit Card" },
  { value: "debit", label: "Debit Card" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "invoice", label: "Invoice" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "other", label: "Other" },
];

/**
 * Business types
 */
export const businessTypes = [
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

/**
 * Business industries
 */
export const businessIndustries = [
  { value: "agriculture", label: "Agriculture" },
  { value: "construction", label: "Construction" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "retail", label: "Retail" },
  { value: "food-service", label: "Food Service" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "professional-services", label: "Professional Services" },
  { value: "technology", label: "Technology" },
  { value: "real-estate", label: "Real Estate" },
  { value: "finance", label: "Finance & Insurance" },
  { value: "government", label: "Government" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "other", label: "Other" },
];

/**
 * Credit terms options
 */
export const creditTermsOptions = [
  { value: "net-15", label: "Net 15" },
  { value: "net-30", label: "Net 30" },
  { value: "net-45", label: "Net 45" },
  { value: "net-60", label: "Net 60" },
  { value: "cod", label: "Cash on Delivery" },
  { value: "custom", label: "Custom Terms" },
];

/**
 * Service types
 */
export const serviceTypes = [
  { value: "maintenance", label: "Regular Maintenance" },
  { value: "repair", label: "Repair Services" },
  { value: "emergency", label: "Emergency Services" },
  { value: "inspection", label: "Inspection Services" },
  { value: "installation", label: "Installation Services" },
  { value: "consultation", label: "Consultation" },
  { value: "other", label: "Other" },
];
