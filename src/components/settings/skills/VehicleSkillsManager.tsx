
import { BaseSkillManager } from './BaseSkillManager';
import { vehicleManufacturers } from "@/components/team/form/skills/categories/vehicleManufacturers";

export function VehicleSkillsManager() {
  const initialCategories = [
    {
      name: 'North American',
      skills: vehicleManufacturers.northAmerican
    },
    {
      name: 'European',
      skills: vehicleManufacturers.european
    },
    {
      name: 'Asian',
      skills: vehicleManufacturers.asian
    }
  ];

  return <BaseSkillManager initialCategories={initialCategories} title="Vehicle Manufacturers" />;
}
