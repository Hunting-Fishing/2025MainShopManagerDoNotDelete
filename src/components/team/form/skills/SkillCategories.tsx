
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
    skills: [
      'Polaris',
      'Can-Am (BRP)',
      'Yamaha',
      'Honda',
      'Kawasaki',
      'Suzuki',
      'Arctic Cat',
      'CF Moto',
      'Kymco',
      'Hisun',
      'Segway Powersports',
      'Tracker Off Road',
      'Massimo',
      'Tao Motor',
      'SSR Motorsports',
      'Linhai'
    ]
  },
  workUtility: {
    name: 'Work Utility ATV/UTV',
    skills: [
      'John Deere Gator',
      'Kubota RTV',
      'Bobcat Utility Vehicles',
      'Mahindra ROXOR',
      'Kioti Mechron',
      'Gravely Atlas',
      'JCB Workmax'
    ]
  },
  europeanNiche: {
    name: 'European & Niche ATV/UTV',
    skills: [
      'TGB (Taiwan Golden Bee)',
      'Access Motor',
      'GOES',
      'Quadzilla'
    ]
  }
};

const getAllAtvUtvSkills = () => {
  return [
    ...atvUtvCategories.recreational.skills,
    ...atvUtvCategories.workUtility.skills,
    ...atvUtvCategories.europeanNiche.skills
  ].sort((a, b) => a.localeCompare(b));
};

const formatVehicleSubCategories = (categories: typeof vehicleManufacturers): Record<string, string[] | { name: string; skills: string[] }> => {
  const result: Record<string, string[] | { name: string; skills: string[] }> = {};
  
  if (Array.isArray(categories.northAmerican)) {
    result.northAmerican = categories.northAmerican;
    result.european = categories.european;
    result.asian = categories.asian;
    result.electricAndOther = categories.electricAndOther;
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
    subCategories: {
      northAmerican: vehicleManufacturers.northAmerican,
      european: vehicleManufacturers.european,
      asian: vehicleManufacturers.asian,
      electricAndOther: vehicleManufacturers.electricAndOther
    }
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
