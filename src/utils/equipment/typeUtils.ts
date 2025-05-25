
import type { EquipmentStatus, MaintenanceRecord, MaintenanceSchedule } from "@/types/equipment";

/**
 * Safely converts Json arrays to typed arrays
 */
export function safeArrayConversion<T>(value: any, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as unknown) as T[] : fallback;
}

/**
 * Normalizes equipment status from database
 */
export function normalizeEquipmentStatus(status: string): EquipmentStatus {
  return status as EquipmentStatus;
}

/**
 * Transforms raw equipment data from database to application format
 */
export function transformEquipmentData(item: any) {
  return {
    ...item,
    status: normalizeEquipmentStatus(item.status),
    shop_id: null, // Equipment table doesn't have shop_id, so set to null
    work_order_history: safeArrayConversion(item.work_order_history),
    maintenance_history: safeArrayConversion<MaintenanceRecord>(item.maintenance_history),
    maintenance_schedules: safeArrayConversion<MaintenanceSchedule>(item.maintenance_schedules),
  };
}

/**
 * Prepares equipment data for database insertion
 */
export function prepareEquipmentForInsert(equipmentData: any) {
  return {
    name: equipmentData.name,
    model: equipmentData.model || '',
    serial_number: equipmentData.serial_number || '',
    manufacturer: equipmentData.manufacturer || '',
    category: equipmentData.category,
    purchase_date: equipmentData.purchase_date || '',
    install_date: equipmentData.install_date || '',
    customer: equipmentData.customer,
    location: equipmentData.location || '',
    status: equipmentData.status || 'operational',
    next_maintenance_date: equipmentData.next_maintenance_date || '',
    maintenance_frequency: equipmentData.maintenance_frequency || 'quarterly',
    last_maintenance_date: equipmentData.last_maintenance_date || '',
    warranty_expiry_date: equipmentData.warranty_expiry_date || '',
    warranty_status: equipmentData.warranty_status || '',
    notes: equipmentData.notes || '',
  };
}
