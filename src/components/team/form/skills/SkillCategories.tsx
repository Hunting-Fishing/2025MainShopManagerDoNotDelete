
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

// Define the category interface
export interface SkillCategory {
  id: string;
  name: string;
  icon: ReactNode;
  skills: string[];
  subCategories?: Record<string, string[]> | Record<string, { name: string; skills: string[] }>;
}

// Define the skill categories
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
    subCategories: vehicleManufacturers
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
