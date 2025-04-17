
import React, { ReactNode } from 'react';
import { Wrench, Zap, Clipboard, PenTool, Car, Truck, Construction } from "lucide-react";
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

// Define the category interface with more specific types
export interface SkillCategory {
  id: string;
  name: string;
  icon: ReactNode;
  skills: string[];
  subCategories?: Record<string, string[] | { name: string; skills: string[] }>;
}

// Improved function to correctly handle both array and object subcategories
const formatVehicleSubCategories = (categories: typeof vehicleManufacturers) => {
  const result: Record<string, string[] | { name: string; skills: string[] }> = {};
  
  // Traditional array categories
  if (Array.isArray(categories.northAmerican)) {
    result.northAmerican = categories.northAmerican;
    result.european = categories.european;
    result.asian = categories.asian;
    result.electricAndOther = categories.electricAndOther;
  }

  // Object-style categories (preserve the full objects)
  if ('atvUtv' in categories && categories.atvUtv) {
    result.atvUtv = categories.atvUtv;
  }
  
  if ('workUtilityAtvUtv' in categories && categories.workUtilityAtvUtv) {
    result.workUtilityAtvUtv = categories.workUtilityAtvUtv;
  }
  
  if ('europeanNicheAtvUtv' in categories && categories.europeanNicheAtvUtv) {
    result.europeanNicheAtvUtv = categories.europeanNicheAtvUtv;
  }

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
    subCategories: formatVehicleSubCategories(vehicleManufacturers)
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

// Proficiency levels
export const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];
