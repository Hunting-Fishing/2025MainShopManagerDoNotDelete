
// Define the type for service items
type ServiceItem = {
  name: string;
  services: string[];
};

export type ServiceCategory = {
  name: string;
  subcategories: ServiceItem[];
};

// Main service categories with their subcategories
export const serviceCategories: ServiceCategory[] = [
  {
    name: "Engine Services",
    subcategories: [
      {
        name: "Engine Maintenance",
        services: [
          "Oil Change",
          "Oil Filter Replacement",
          "Air Filter Replacement",
          "Spark Plug Replacement",
          "Timing Belt Service"
        ]
      },
      {
        name: "Engine Diagnostics",
        services: [
          "Check Engine Light Diagnosis",
          "Engine Performance Testing",
          "Fuel System Cleaning",
          "Compression Test",
          "Emissions System Check"
        ]
      }
    ]
  },
  {
    name: "Transmission",
    subcategories: [
      {
        name: "Transmission Service",
        services: [
          "Transmission Fluid Change",
          "Transmission Filter Replacement",
          "Clutch Adjustment",
          "Transmission Flush"
        ]
      },
      {
        name: "Transmission Repair",
        services: [
          "Clutch Repair/Replacement",
          "Transmission Rebuild",
          "Gear Box Service",
          "Differential Service"
        ]
      }
    ]
  },
  {
    name: "Brake System",
    subcategories: [
      {
        name: "Brake Maintenance",
        services: [
          "Brake Pad Replacement",
          "Brake Rotor Resurfacing",
          "Brake Fluid Flush",
          "Brake Line Inspection"
        ]
      },
      {
        name: "Brake Repair",
        services: [
          "Brake Caliper Replacement",
          "Master Cylinder Repair",
          "ABS System Service",
          "Emergency Brake Adjustment"
        ]
      }
    ]
  },
  {
    name: "Suspension & Steering",
    subcategories: [
      {
        name: "Suspension Service",
        services: [
          "Shock/Strut Replacement",
          "Spring Replacement",
          "Ball Joint Service",
          "Bushing Replacement"
        ]
      },
      {
        name: "Steering Service",
        services: [
          "Power Steering Fluid Service",
          "Steering Rack Service",
          "Tie Rod Replacement",
          "Steering Column Repair"
        ]
      }
    ]
  }
];
