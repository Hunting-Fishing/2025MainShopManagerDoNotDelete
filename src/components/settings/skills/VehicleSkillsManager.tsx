
import { BaseSkillManager } from './BaseSkillManager';
import { vehicleManufacturers } from "@/components/team/form/skills/categories/vehicleManufacturers";

export function VehicleSkillsManager() {
  const initialCategories = [
    {
      name: 'Asian Manufacturers',
      skills: vehicleManufacturers.asian.map(m => `${m.flag} ${m.name}`)
    },
    {
      name: 'North American Manufacturers',
      skills: vehicleManufacturers.northAmerican.map(m => `${m.flag} ${m.name}`)
    },
    {
      name: 'European Manufacturers',
      skills: vehicleManufacturers.european.map(m => `${m.flag} ${m.name}`)
    },
    {
      name: 'Electric & New Tech',
      skills: vehicleManufacturers.electricAndOther.map(m => `${m.flag} ${m.name}`)
    }
  ];

  return <BaseSkillManager initialCategories={initialCategories} title="Vehicle Manufacturers" />;
}

