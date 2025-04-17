import React, { ReactNode } from 'react';
import { Wrench, Zap, Clipboard, PenTool, Car } from "lucide-react";

// Define the category interface
export interface SkillCategory {
  id: string;
  name: string;
  icon: ReactNode;
  skills: string[];
}

// Define the skill categories
export const skillCategories: SkillCategory[] = [
  {
    id: 'mechanical',
    name: 'Mechanical Systems',
    icon: <Wrench className="h-4 w-4 mr-2" />,
    skills: [
      'Engine Repair',
      'Cooling System',
      'Fuel System',
      'Drivetrain',
      'Transmission',
      'Brakes',
      'Suspension'
    ].sort()
  },
  {
    id: 'electrical',
    name: 'Electrical Systems',
    icon: <Zap className="h-4 w-4 mr-2" />,
    skills: [
      'Diagnostics',
      'ECU Programming',
      'Hybrid/EV Systems',
      'ADAS Calibration',
      'Wiring',
      'Battery Systems'
    ].sort()
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Service',
    icon: <Clipboard className="h-4 w-4 mr-2" />,
    skills: [
      'Oil Changes',
      'Tire Rotation',
      'Tire Balancing',
      'Brake Service',
      'Fluid Flushes',
      'Tune-ups',
      'Inspections'
    ].sort()
  },
  {
    id: 'custom',
    name: 'Performance & Custom Work',
    icon: <PenTool className="h-4 w-4 mr-2" />,
    skills: [
      'Exhaust Modifications',
      'Suspension Lifts',
      'Tuning & Reprogramming',
      'Performance Upgrades',
      'Custom Fabrication'
    ].sort()
  },
  {
    id: 'vehicles',
    name: 'Vehicle Manufacturers',
    icon: <Car className="h-4 w-4 mr-2" />,
    skills: [
      'Acura',
      'Alfa Romeo',
      'Audi',
      'Bentley',
      'BMW',
      'Buick',
      'Cadillac',
      'Chevrolet',
      'Chrysler',
      'Dodge',
      'Ferrari',
      'Fiat',
      'Fisker',
      'Ford',
      'Genesis',
      'GMC',
      'Honda',
      'Hyundai',
      'Infiniti',
      'Jaguar',
      'Jeep',
      'Kia',
      'Lamborghini',
      'Land Rover',
      'Lexus',
      'Lincoln',
      'Lucid',
      'Maserati',
      'Mazda',
      'Mercedes-Benz',
      'Mini',
      'Mitsubishi',
      'Nissan',
      'Opel',
      'Peugeot',
      'Polestar',
      'Pontiac',
      'Porsche',
      'Ram',
      'Renault',
      'Rivian',
      'Rolls-Royce',
      'Saturn',
      'SEAT',
      'Smart',
      'Škoda',
      'Subaru',
      'Suzuki',
      'Tesla',
      'Toyota',
      'Vauxhall',
      'Volkswagen',
      'Volvo'
    ].sort()
  }
];

// Proficiency levels
export const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];
