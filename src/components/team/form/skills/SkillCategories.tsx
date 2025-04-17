import React, { ReactNode } from 'react';
import { Wrench, Zap, Clipboard, PenTool, Car, Truck } from "lucide-react";

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
      // North American Manufacturers
      'Buick',
      'Cadillac',
      'Chevrolet',
      'Chrysler',
      'Dodge',
      'Ford',
      'GMC',
      'Lincoln',
      'Pontiac',
      'Ram',
      'Saturn',
      
      // European Manufacturers
      'Alfa Romeo',
      'Audi',
      'Bentley',
      'BMW',
      'Fiat',
      'Jaguar',
      'Lamborghini',
      'Land Rover',
      'Maserati',
      'Mercedes-Benz',
      'Mini',
      'Opel',
      'Peugeot',
      'Porsche',
      'Renault',
      'Rolls-Royce',
      'SEAT',
      'Smart',
      'Škoda',
      'Vauxhall',
      'Volkswagen',
      'Volvo',
      
      // Asian Manufacturers
      'Acura',
      'Genesis',
      'Honda',
      'Hyundai',
      'Infiniti',
      'Kia',
      'Lexus',
      'Mazda',
      'Mitsubishi',
      'Nissan',
      'Subaru',
      'Suzuki',
      'Toyota',
      
      // Electric/Other Manufacturers
      'Ferrari',
      'Fisker',
      'Lucid',
      'Polestar',
      'Rivian',
      'Tesla'
    ].sort((a, b) => a.localeCompare(b))
  },
  {
    id: 'commercial-vehicles',
    name: 'Commercial & Specialty Vehicles',
    icon: <Truck className="h-4 w-4 mr-2" />,
    skills: [
      // Heavy-Duty Trucks / Commercial Brands
      'DAF',
      'Mack',
      'MAN',
      'Navistar',
      'Scania',
      'Sterling',
      'Volvo Trucks',
      'Western Star',
      
      // Bus / Shuttle Manufacturers
      'Blue Bird',
      'Gillig',
      'IC Bus',
      'New Flyer',
      'Prevost',
      'Thomas Built Buses',
      
      // Recreational / RV Manufacturers
      'Coachmen',
      'Jayco',
      'Thor Industries',
      'Tiffin Motorhomes',
      'Winnebago',
      
      // Utility / Work Truck Builders
      'Crysteel',
      'Morgan Olson',
      'Reading Truck Group',
      'Spartan Motors',
      'Utilimaster',
      'Workhorse Group'
    ].sort()
  }
];

// Proficiency levels
export const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];
