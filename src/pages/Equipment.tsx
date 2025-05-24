import { useEffect, useState } from "react";
import { EquipmentTable } from "@/components/equipment/EquipmentTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { MaintenanceDueCard } from "@/components/equipment/MaintenanceDueCard";
import { WarrantyExpiringCard } from "@/components/equipment/WarrantyExpiringCard";
import { fetchEquipment } from "@/services/equipmentService";
import type { EquipmentWithMaintenance } from "@/services/equipmentService";
import { getMaintenanceDueEquipment, getWarrantyExpiringEquipment } from "@/data/equipmentData";

export default function Equipment() {
  const [equipment, setEquipment] = useState<EquipmentWithMaintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const data = await fetchEquipment();
        setEquipment(data);
      } catch (error) {
        console.error("Error loading equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, []);

  // Transform the data for legacy components that expect camelCase
  const transformedEquipment = equipment.map(item => ({
    ...item,
    serialNumber: item.serial_number,
    purchaseDate: item.purchase_date,
    installDate: item.install_date,
    nextMaintenanceDate: item.next_maintenance_date,
    lastMaintenanceDate: item.last_maintenance_date,
    warrantyExpiryDate: item.warranty_expiry_date,
    warrantyStatus: item.warranty_status,
    maintenanceFrequency: item.maintenance_frequency,
    workOrderHistory: item.work_order_history,
    maintenanceHistory: item.maintenance_history,
    maintenanceSchedules: item.maintenance_schedules || []
  }));

  // Calculate summary data using database fields
  const maintenanceDueEquipment = equipment.filter(item => {
    if (!item.next_maintenance_date) return false;
    const today = new Date();
    const dueDate = new Date(item.next_maintenance_date);
    const daysFromNow = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysFromNow <= 30;
  });

  const warrantyExpiringEquipment = equipment.filter(item => {
    if (!item.warranty_expiry_date || item.warranty_status !== "active") return false;
    const today = new Date();
    const expiryDate = new Date(item.warranty_expiry_date);
    const daysFromNow = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysFromNow <= 60 && daysFromNow >= 0;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
        <Button asChild>
          <Link to="/equipment/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Equipment
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <MaintenanceDueCard equipment={maintenanceDueEquipment} />
        <WarrantyExpiringCard equipment={warrantyExpiringEquipment} />
      </div>

      {/* Equipment Table */}
      <EquipmentTable equipment={equipment} loading={loading} />
    </div>
  );
}
