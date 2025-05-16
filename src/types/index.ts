
// Re-export all types from their respective files
export * from './inventory';
export * from './customer';
export * from './invoice';
export * from './workOrder';
export * from './vehicle';

// For types from missing modules, we will create placeholder exports
// For staff.ts
export interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

// For appointment type
export interface Appointment {
  id: string;
  date: string;
  customer_id: string;
  status: string;
}

// For auth types
export interface AuthUser {
  id: string;
  email: string;
}

// For company types
export interface Company {
  id: string;
  name: string;
  address?: string;
}

// For segment types
export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface SegmentRule {
  id: string;
  segmentId: string;
  ruleType: string;
  ruleOperator: string;
  ruleValue: string;
}

// For pdf types
export interface PdfOptions {
  format?: string;
  orientation?: 'portrait' | 'landscape';
}

// For user types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// For maintenance types
export type { MaintenanceSchedule } from "./maintenance";

// For repair types
export interface RepairService {
  id: string;
  name: string;
  description?: string;
  estimatedHours?: number;
  price?: number;
}

export interface RepairPart {
  id: string;
  name: string;
  partNumber: string;
  price?: number;
}

// For filter types
export interface FilterOptions {
  startDate: string;
  endDate: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Use export type for type exports
export type { FilterOptions, SortOptions };
