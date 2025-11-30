export type IncidentType = 
  | 'shop_injury' 
  | 'chemical_exposure' 
  | 'fire_heat_hazard' 
  | 'slip_trip' 
  | 'lifting_injury' 
  | 'equipment_failure' 
  | 'ev_battery_hazard' 
  | 'high_pressure_injection' 
  | 'near_miss' 
  | 'other';

export type IncidentSeverity = 'minor' | 'moderate' | 'serious' | 'critical';
export type InvestigationStatus = 'open' | 'under_investigation' | 'resolved' | 'closed';
export type InjuredPersonType = 'employee' | 'contractor' | 'visitor' | 'customer';

export interface SafetyIncident {
  id: string;
  shop_id: string;
  reported_by: string | null;
  incident_date: string;
  incident_time: string | null;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  location: string;
  equipment_id: string | null;
  vehicle_id: string | null;
  title: string;
  description: string;
  root_cause: string | null;
  injured_person_name: string | null;
  injured_person_type: InjuredPersonType | null;
  injury_details: string | null;
  medical_treatment_required: boolean;
  medical_treatment_description: string | null;
  witnesses: { name: string; contact: string; statement: string }[];
  photos: string[];
  investigation_status: InvestigationStatus;
  corrective_actions: string | null;
  preventive_measures: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  osha_reportable: boolean;
  workers_comp_claim_filed: boolean;
  claim_number: string | null;
  created_at: string;
  updated_at: string;
}

export type InspectionShift = 'morning' | 'afternoon' | 'night';
export type InspectionOverallStatus = 'pass' | 'pass_with_issues' | 'fail';

export interface ChecklistItem {
  checked: boolean;
  status: 'ok' | 'warning' | 'fail' | 'na';
  notes: string;
}

export interface DailyShopInspection {
  id: string;
  shop_id: string;
  inspector_id: string;
  inspection_date: string;
  shift: InspectionShift | null;
  checklist_items: Record<string, ChecklistItem>;
  overall_status: InspectionOverallStatus | null;
  hazards_found: string[];
  corrective_actions_needed: string | null;
  inspector_signature: string | null;
  supervisor_review_by: string | null;
  supervisor_reviewed_at: string | null;
  created_at: string;
}

export type DVIRReportType = 'pre_trip' | 'post_trip';

export interface DVIRInspectionItem {
  ok: boolean;
  notes: string;
}

export interface DVIRReport {
  id: string;
  shop_id: string;
  driver_id: string;
  vehicle_id: string | null;
  report_date: string;
  report_type: DVIRReportType;
  odometer_reading: number | null;
  inspection_items: Record<string, DVIRInspectionItem>;
  defects_found: boolean;
  defects_description: string | null;
  vehicle_safe_to_operate: boolean;
  driver_signature: string | null;
  mechanic_review_required: boolean;
  mechanic_reviewed_by: string | null;
  mechanic_review_notes: string | null;
  mechanic_signature: string | null;
  created_at: string;
}

export type SafetyDocumentType = 
  | 'sds' 
  | 'safety_manual' 
  | 'procedure' 
  | 'working_at_height' 
  | 'torque_specs' 
  | 'wiring_diagram' 
  | 'equipment_manual' 
  | 'emergency_plan' 
  | 'other';

export interface SafetyDocument {
  id: string;
  shop_id: string;
  document_type: SafetyDocumentType;
  title: string;
  description: string | null;
  chemical_name: string | null;
  manufacturer: string | null;
  hazard_classification: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  version: string;
  effective_date: string | null;
  expiry_date: string | null;
  applicable_locations: string[];
  applicable_equipment_ids: string[];
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export type LiftInspectionType = 'daily_pre_use' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type LiftEquipmentType = 
  | 'two_post_lift' 
  | 'four_post_lift' 
  | 'scissor_lift' 
  | 'alignment_lift' 
  | 'mobile_column_lift' 
  | 'engine_hoist' 
  | 'transmission_jack' 
  | 'floor_jack' 
  | 'jack_stands' 
  | 'other';
export type LiftCondition = 'good' | 'fair' | 'needs_attention' | 'out_of_service';

export interface LiftHoistInspection {
  id: string;
  shop_id: string;
  equipment_id: string | null;
  inspector_id: string;
  inspection_date: string;
  inspection_type: LiftInspectionType;
  equipment_type: LiftEquipmentType;
  equipment_name: string;
  serial_number: string | null;
  checklist_items: Record<string, ChecklistItem>;
  overall_condition: LiftCondition | null;
  defects_found: boolean;
  defects_description: string | null;
  safe_for_use: boolean;
  lockout_required: boolean;
  lockout_reason: string | null;
  inspector_signature: string | null;
  next_inspection_due: string | null;
  created_at: string;
}

// Dashboard Stats
export interface SafetyDashboardStats {
  openIncidents: number;
  criticalIncidents: number;
  todayInspectionsCompleted: number;
  todayInspectionsTotal: number;
  expiringCertificates: number;
  expiredCertificates: number;
  unsafeEquipment: number;
  pendingDVIRs: number;
}

// Label mappings for display
export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  shop_injury: 'Shop Injury',
  chemical_exposure: 'Chemical Exposure',
  fire_heat_hazard: 'Fire/Heat Hazard',
  slip_trip: 'Slip/Trip/Fall',
  lifting_injury: 'Lifting Injury',
  equipment_failure: 'Equipment Failure',
  ev_battery_hazard: 'EV Battery Hazard',
  high_pressure_injection: 'High Pressure Injection',
  near_miss: 'Near Miss',
  other: 'Other'
};

export const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  serious: 'Serious',
  critical: 'Critical'
};

export const STATUS_LABELS: Record<InvestigationStatus, string> = {
  open: 'Open',
  under_investigation: 'Under Investigation',
  resolved: 'Resolved',
  closed: 'Closed'
};
