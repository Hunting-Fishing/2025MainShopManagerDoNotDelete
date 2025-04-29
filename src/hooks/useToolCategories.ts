
import { useState, useEffect } from 'react';

// Interface for tool category data
export interface ToolCategory {
  category: string;
  description?: string;
  items: string[];
  isNew?: boolean;
  isPopular?: boolean;
}

export function useToolCategories() {
  const [toolCategories, setToolCategories] = useState<ToolCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToolCategories = async () => {
      try {
        // In a real application, this would be an API call
        // For now, we'll use the hardcoded data from ShoppingCategories
        const categories = [
          {
            category: "Hand Tools",
            description: "Essential hand tools for every mechanic and DIY enthusiast",
            isPopular: true,
            items: [
              "Wrenches & Wrench Sets",
              "Sockets & Socket Sets",
              "Pliers",
              "Screwdrivers",
              "Hammers & Mallets"
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
              "Polishers"
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
              "Pressure Testers"
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
              "Engine Hoists & Stands"
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
              "Oil Service Tools"
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
              "Masking Supplies"
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
              "Tire & Wheel Cleaners"
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
              "Trouble Lights"
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
              "Transmission Jacks"
            ]
          }
        ];
        
        setToolCategories(categories);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading tool categories:", error);
        setIsLoading(false);
      }
    };

    fetchToolCategories();
  }, []);

  return { toolCategories, isLoading };
}
