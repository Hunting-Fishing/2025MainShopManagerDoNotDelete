
import { Link } from "react-router-dom";
import { Equipment } from "@/types/equipment";
import { EquipmentStatusBadge } from "./EquipmentStatusBadge";
import { WarrantyStatusBadge } from "./WarrantyStatusBadge";
import { CogIcon, Loader2 } from "lucide-react";

interface EquipmentTableProps {
  equipment: Equipment[];
  loading?: boolean;
}

export function EquipmentTable({ equipment, loading = false }: EquipmentTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-slate-300 animate-spin" />
          <p className="mt-4 text-slate-500">Loading equipment data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Next Maintenance
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Warranty Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {equipment.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center text-sm text-slate-500">
                <div className="flex flex-col items-center justify-center py-6">
                  <CogIcon className="h-12 w-12 text-slate-300" />
                  <p className="mt-2 text-slate-500">No equipment found</p>
                </div>
              </td>
            </tr>
          ) : (
            equipment.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {item.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <EquipmentStatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {item.nextMaintenanceDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <WarrantyStatusBadge status={item.warrantyStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/equipment/${item.id}`} className="text-blue-600 hover:text-blue-800 mr-4">
                    View
                  </Link>
                  <Link to={`/equipment/${item.id}/edit`} className="text-blue-600 hover:text-blue-800">
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
