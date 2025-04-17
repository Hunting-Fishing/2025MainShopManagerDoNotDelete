
import React, { ReactNode } from 'react';
import { Wrench, Zap, Clipboard, PenTool, Car, Truck, Construction, Bike } from "lucide-react";
import {
  mechanicalSkills,
  electricalSkills,
  maintenanceSkills,
  performanceSkills,
  getAllVehicleManufacturers,
  getAllCommercialVehicles,
  vehicleManufacturers,
  commercialVehicles,
  equipmentSkills,
  getAllEquipmentSkills
} from './categories';
import { groupedAtvUtvBrands, getAllAtvUtvBrands } from './categories/atvUtvBrands';

export interface SkillCategory {
  id: string;
  name: string;
  icon: ReactNode;
  skills: string[];
  subCategories?: Record<string, string[] | { name: string; skills: string[] }>;
}

const atvUtvCategories = {
  recreational: {
    name: 'Recreational ATV/UTV',
    skills: groupedAtvUtvBrands.recreational.map(brand => `${brand.flag} ${brand.name}`)
  },
  workUtility: {
    name: 'Work Utility ATV/UTV',
    skills: groupedAtvUtvBrands.workUtility.map(brand => `${brand.flag} ${brand.name}`)
  },
  electric: {
    name: 'Electric & New Tech',
    skills: groupedAtvUtvBrands.electric.map(brand => `${brand.flag} ${brand.name}`)
  },
  global: {
    name: 'Global & Niche Brands',
    skills: groupedAtvUtvBrands.european.map(brand => `${brand.flag} ${brand.name}`)
  }
};

const getAllAtvUtvSkills = () => {
  return [
    ...atvUtvCategories.recreational.skills,
    ...atvUtvCategories.workUtility.skills,
    ...atvUtvCategories.electric.skills,
    ...atvUtvCategories.global.skills
  ].sort((a, b) => a.localeCompare(b));
};

// Format vehicle manufacturers into the expected structure
const formatVehicleSubCategories = () => {
  const result: Record<string, { name: string; skills: string[] }> = {
    northAmerican: {
      name: 'North American Manufacturers',
      skills: vehicleManufacturers.northAmerican.map(m => `${m.flag} ${m.name}`)
    },
    european: {
      name: 'European Manufacturers',
      skills: vehicleManufacturers.european.map(m => `${m.flag} ${m.name}`)
    },
    asian: {
      name: 'Asian Manufacturers',
      skills: vehicleManufacturers.asian.map(m => `${m.flag} ${m.name}`)
    },
    electricAndOther: {
      name: 'Electric & New Tech',
      skills: vehicleManufacturers.electricAndOther.map(m => `${m.flag} ${m.name}`)
    }
  };
  
  return result;
};

export const skillCategories: SkillCategory[] = [
  {
    id: 'mechanical',
    name: 'Mechanical Systems',
    icon: <Wrench className="h-4 w-4 mr-2" />,
    skills: mechanicalSkills
  },
  {
    id: 'electrical',
    name: 'Electrical Systems',
    icon: <Zap className="h-4 w-4 mr-2" />,
    skills: electricalSkills
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Service',
    icon: <Clipboard className="h-4 w-4 mr-2" />,
    skills: maintenanceSkills
  },
  {
    id: 'custom',
    name: 'Performance & Custom Work',
    icon: <PenTool className="h-4 w-4 mr-2" />,
    skills: performanceSkills
  },
  {
    id: 'vehicles',
    name: 'Vehicle Manufacturers',
    icon: <Car className="h-4 w-4 mr-2" />,
    skills: getAllVehicleManufacturers(),
    subCategories: formatVehicleSubCategories()
  },
  {
    id: 'atv-utv',
    name: 'ATV & UTV',
    icon: <Bike className="h-4 w-4 mr-2" />,
    skills: getAllAtvUtvSkills(),
    subCategories: atvUtvCategories
  },
  {
    id: 'commercial-vehicles',
    name: 'Commercial & Specialty Vehicles',
    icon: <Truck className="h-4 w-4 mr-2" />,
    skills: getAllCommercialVehicles(),
    subCategories: commercialVehicles
  },
  {
    id: 'equipment',
    name: 'Heavy Equipment & Machinery',
    icon: <Construction className="h-4 w-4 mr-2" />,
    skills: getAllEquipmentSkills(),
    subCategories: equipmentSkills
  }
];

export const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];
