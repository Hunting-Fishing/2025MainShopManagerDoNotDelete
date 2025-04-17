
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
    name: 'Vehicle Makes & Models',
    icon: <Car className="h-4 w-4 mr-2" />,
    skills: [
      'Ford F-150',
      'Ford Explorer',
      'Ford Escape',
      'Ford Mustang',
      'Chevrolet Silverado',
      'Chevrolet Malibu',
      'Chevrolet Equinox',
      'Chevrolet Tahoe',
      'Toyota Camry',
      'Toyota Corolla',
      'Toyota RAV4',
      'Toyota Tacoma',
      'Honda Accord',
      'Honda Civic',
      'Honda CR-V',
      'Honda Pilot',
      'Nissan Altima',
      'Nissan Sentra',
      'Nissan Rogue',
      'Nissan Frontier',
      'BMW 3 Series',
      'BMW 5 Series',
      'BMW X3',
      'BMW X5',
      'Mercedes-Benz C-Class',
      'Mercedes-Benz E-Class',
      'Mercedes-Benz GLC',
      'Mercedes-Benz GLE',
      'Volkswagen Jetta',
      'Volkswagen Passat',
      'Volkswagen Tiguan',
      'Volkswagen Atlas',
      'Audi A4',
      'Audi Q5',
      'Audi A6',
      'Audi Q7',
      'Subaru Outback',
      'Subaru Forester',
      'Subaru Impreza',
      'Subaru Crosstrek'
    ].sort()
  }
];

// Proficiency levels
export const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];
