
import React from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { CategoryToolList } from '@/components/shopping/CategoryToolList';

const ShoppingCategories = () => {
  const toolCategories = [
    {
      category: "Hand Tools",
      description: "Essential hand tools for every mechanic and DIY enthusiast",
      isPopular: true,
      items: [
        "Wrenches & Wrench Sets",
        "Sockets & Socket Sets",
        "Pliers",
        "Screwdrivers",
        "Hammers & Mallets",
        "Pry Bars",
        "Files & Rasps",
        "Punches & Chisels",
        "Hex & Torx Keys",
        "Measuring & Marking Tools"
      ]
    },
    {
      category: "Power Tools",
      description: "Electric and battery-powered tools for faster and efficient work",
      items: [
        "Drills & Impact Drivers",
        "Grinders",
        "Saws & Cutters", 
        "Sanders",
        "Polishers",
        "Air Compressors",
        "Impact Wrenches",
        "Heat Guns",
        "Cordless Tool Kits",
        "Batteries & Chargers"
      ]
    },
    {
      category: "Diagnostic Tools",
      description: "Modern tools for diagnosing vehicle and engine issues",
      isNew: true,
      items: [
        "OBD Scanners",
        "Code Readers",
        "Multimeters",
        "Circuit Testers",
        "Pressure Testers",
        "Battery Testers",
        "Compression Testers",
        "Leak Detectors",
        "Thermal Imaging Cameras",
        "Borescopes & Inspection Cameras"
      ]
    },
    {
      category: "Shop Equipment",
      description: "Heavy-duty equipment to equip your shop or garage",
      items: [
        "Jacks & Jack Stands",
        "Lifts",
        "Workbenches",
        "Tool Chests & Cabinets",
        "Engine Hoists & Stands",
        "Press Tools",
        "Battery Chargers",
        "Welding Equipment",
        "Air Tools",
        "Shop Vacuums"
      ]
    },
    {
      category: "Specialty Tools",
      description: "Specialized tools for specific automotive jobs",
      items: [
        "Brake Tools",
        "Suspension Tools",
        "Engine Service Tools",
        "Timing Tools",
        "Oil Service Tools",
        "Fuel System Tools",
        "Electrical Tools",
        "Pullers",
        "Transmission Tools",
        "Steering Tools"
      ]
    },
    {
      category: "Body Shop",
      description: "Tools for automotive body repair and painting",
      items: [
        "Panel Beaters",
        "Dent Pullers",
        "Body Fillers",
        "Spray Guns",
        "Masking Supplies",
        "Buffing & Polishing",
        "Sandpaper & Abrasives",
        "Auto Body Hammers",
        "Dollies",
        "Paint Mixing Equipment"
      ]
    },
    {
      category: "Cleaning Supplies",
      description: "Products to keep your vehicle and shop clean",
      items: [
        "Degreasers",
        "Car Wash Soaps",
        "Interior Cleaners",
        "Glass Cleaners",
        "Tire & Wheel Cleaners",
        "Detailing Tools",
        "Microfiber Cloths",
        "Shop Towels",
        "Hand Cleaners",
        "Parts Washers"
      ]
    },
    {
      category: "Lighting",
      description: "Work lights and automotive lighting solutions",
      items: [
        "Work Lights",
        "Flashlights",
        "Headlamps",
        "LED Light Bars",
        "Trouble Lights",
        "Shop Lighting",
        "Inspection Lights",
        "UV Leak Detection Lights",
        "Light Stands",
        "Battery Operated Lights"
      ]
    },
    {
      category: "Lifting Equipment",
      description: "Tools to safely lift heavy components and vehicles",
      items: [
        "Floor Jacks",
        "Jack Stands",
        "Hydraulic Jacks",
        "Bottle Jacks",
        "Transmission Jacks",
        "Engine Cranes",
        "Vehicle Ramps",
        "Hoists",
        "Wheel Dollies",
        "Lift Accessories"
      ]
    }
  ];

  return (
    <ShoppingPageLayout
      title="Tool Categories"
      description="Browse our complete collection of automotive tools and equipment"
    >
      <CategoryToolList
        title="Shop by Category"
        description="Find the perfect tools for your automotive projects"
        tools={toolCategories}
      />
    </ShoppingPageLayout>
  );
};

export default ShoppingCategories;
