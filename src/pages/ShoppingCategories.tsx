
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  ShieldAlert, 
  ArrowUp, 
  Fuel, 
  Gauge, 
  Snowflake, 
  RotateCcw, 
  Hammer, 
  Sparkles, 
  Activity, 
  Battery, 
  Wrench as WrenchIcon 
} from 'lucide-react'; // Removed BrakeWarning and replaced with appropriate icons
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryToolList } from '@/components/shopping/CategoryToolList';

const ShoppingCategories = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  
  // Tool categories data structure
  const toolsData = {
    general: {
      title: "General Automotive Tools",
      description: "These tools are commonly used across many automotive repair and maintenance tasks.",
      categories: [
        {
          category: "Safety Gear",
          items: [
            "Safety glasses",
            "Nitrile gloves",
            "Dust masks"
          ]
        },
        {
          category: "Lifting Equipment",
          items: [
            "Hydraulic floor jack",
            "Jack stands",
            "Vehicle ramps",
            "Wheel chocks"
          ]
        },
        {
          category: "Hand Tools",
          items: [
            "Ratchet and socket sets (metric & SAE)",
            "Wrench sets (combination, Allen/hex, Torx)",
            "Screwdriver sets (Phillips, flathead, Torx)",
            "Pliers (needlenose, locking, slip-joint)",
            "Torque wrench",
            "Breaker bar",
            "Hammers"
          ]
        },
        {
          category: "Cleaning Supplies",
          items: [
            "Rags",
            "Brushes",
            "Degreaser",
            "Drain pans",
            "Parts washer"
          ]
        },
        {
          category: "Lighting",
          items: [
            "Work light",
            "Headlamp"
          ]
        }
      ]
    },
    oil: {
      title: "Oil Change Tools",
      description: "Specialized tools for performing oil changes on vehicles.",
      categories: [
        {
          category: "Essential Oil Change Tools",
          items: [
            "Oil filter wrench (socket, pliers, or band style)",
            "Funnel",
            "Oil drain pan/container",
            "Sockets/Wrenches (for drain plug)",
            "Torque wrench (for drain plug and filter)",
            "Rags/Newspaper"
          ]
        }
      ]
    },
    brake: {
      title: "Brake Repair Tools",
      description: "Tools needed for brake service and repair.",
      categories: [
        {
          category: "Disc Brake Tools",
          items: [
            "Caliper piston tool / spreader / compressor",
            "Brake cleaner",
            "Sockets/Wrenches (for caliper bolts, mounting brackets)",
            "Lug wrench"
          ]
        },
        {
          category: "Drum Brake Tools",
          items: [
            "Brake spring pliers",
            "Brake spring compressor/installer/retainer/remover tools",
            "Brake adjuster spoons"
          ]
        },
        {
          category: "General Brake Tools",
          items: [
            "Bleeder wrench/kit (for bleeding brakes)",
            "Needlenose pliers",
            "Wire brush (for cleaning hubs/calipers)"
          ]
        }
      ]
    },
    fuel: {
      title: "Fuel Service Tools",
      description: "Tools for fuel system maintenance and repair.",
      categories: [
        {
          category: "Fuel System Tools",
          items: [
            "Fuel line disconnect tools",
            "Fuel pressure tester kit",
            "Injector nozzle tester (especially for diesel)",
            "Fuel filter wrench/tool",
            "Fuel transfer pump/siphon",
            "Lock-ring tool (for fuel pump module access)",
            "Noid lights",
            "Sockets/Wrenches"
          ]
        }
      ]
    },
    tire: {
      title: "Tire Service Tools",
      description: "Tools for tire maintenance and replacement.",
      categories: [
        {
          category: "Tire Tools",
          items: [
            "Lug wrench or impact wrench with sockets",
            "Torque wrench",
            "Tire pressure gauge",
            "Portable tire inflator/air compressor",
            "Tire iron/pry bar",
            "Valve core tool",
            "Wheel wedges/chocks",
            "Jack and jack stands"
          ]
        }
      ]
    },
    ac: {
      title: "A/C Service Tools",
      description: "Tools for air conditioning system service and repair.",
      categories: [
        {
          category: "A/C System Tools",
          items: [
            "A/C manifold gauge set",
            "Vacuum pump",
            "Refrigerant leak detector",
            "Refrigerant scale",
            "Thermometer (digital, infrared)",
            "Schrader valve core removal tool",
            "Can tap (for refrigerant cans)",
            "Safety glasses and gloves",
            "Service port adapters"
          ]
        }
      ]
    },
    transmission: {
      title: "Transmission Service Tools",
      description: "Tools for transmission maintenance and repair.",
      categories: [
        {
          category: "Transmission Tools",
          items: [
            "Fluid pump or funnel with long tube",
            "Drain pan",
            "Sockets/Wrenches (for drain/fill plugs, pan bolts)",
            "Torque wrench",
            "Transmission jack",
            "Diagnostic scan tool",
            "Seal puller/installer",
            "Snap ring pliers"
          ]
        }
      ]
    },
    engine: {
      title: "Engine Repair Tools",
      description: "Tools for engine diagnostics and repairs.",
      categories: [
        {
          category: "General Engine Tools",
          items: [
            "Diagnostic scan tool",
            "Compression tester",
            "Leak-down tester",
            "Vacuum gauge",
            "Stethoscope",
            "Torque wrench"
          ]
        },
        {
          category: "Timing Tools",
          items: [
            "Timing light",
            "Timing belt/chain tools",
            "Camshaft/crankshaft locking tools"
          ]
        },
        {
          category: "Internal Engine Tools",
          items: [
            "Piston ring compressor",
            "Piston ring filer",
            "Piston ring squaring tool",
            "Cylinder hone",
            "Valve spring compressor",
            "Valve seal installer",
            "Micrometer",
            "Dial indicator",
            "Dial bore gauge",
            "Ridge reamer",
            "Cam bearing installation kit",
            "Harmonic balancer puller/installer",
            "Engine stand",
            "Engine hoist/crane"
          ]
        },
        {
          category: "Engine Cleaning Tools",
          items: [
            "Engine brushes",
            "Parts washer"
          ]
        }
      ]
    },
    cooling: {
      title: "Belt & Cooling System Tools",
      description: "Tools for belt replacement and cooling system service.",
      categories: [
        {
          category: "Belt Tools",
          items: [
            "Belt tensioner tool or long breaker bar/ratchet",
            "Sockets/wrenches"
          ]
        },
        {
          category: "Cooling System Tools",
          items: [
            "Radiator pressure tester kit",
            "Coolant funnel kit (spill-free)",
            "Hose clamp pliers",
            "Refractometer or test strips",
            "Drain pan",
            "Thermostat gasket scraper"
          ]
        }
      ]
    },
    suspension: {
      title: "Steering & Suspension Tools",
      description: "Tools for steering and suspension work.",
      categories: [
        {
          category: "General Suspension Tools",
          items: [
            "Pry bars",
            "Pickle fork/ball joint separator",
            "Tie rod end puller",
            "Pitman arm puller",
            "Inner tie rod tool",
            "Large sockets/wrenches",
            "Torque wrench"
          ]
        },
        {
          category: "Suspension Tools",
          items: [
            "Spring compressors",
            "Strut nut socket",
            "CV boot clamp tool/pliers"
          ]
        },
        {
          category: "Alignment Tools",
          items: [
            "Tape measures",
            "Levels",
            "Camber/caster gauges"
          ]
        }
      ]
    },
    battery: {
      title: "Battery Service Tools",
      description: "Tools for battery maintenance and replacement.",
      categories: [
        {
          category: "Battery Tools",
          items: [
            "Sockets/Wrenches (for terminal clamps and hold-downs)",
            "Battery terminal cleaner brush",
            "Battery terminal protector spray or grease",
            "Memory saver",
            "Battery carrier/strap",
            "Battery charger",
            "Battery tester/multimeter"
          ]
        }
      ]
    },
    starting: {
      title: "Starting & Charging System Tools",
      description: "Tools for diagnosing starting and charging system issues.",
      categories: [
        {
          category: "Starting & Charging System Tools",
          items: [
            "Multimeter",
            "Battery tester",
            "Amp clamp",
            "Diagnostic scan tool",
            "Remote starter switch",
            "Voltage drop testing leads/accessories",
            "Alternator test adapters"
          ]
        }
      ]
    },
    diagnostics: {
      title: "Vehicle Diagnostics Tools",
      description: "Tools for diagnosing vehicle issues and problems.",
      categories: [
        {
          category: "Diagnostic Tools",
          items: [
            "OBD-II Scan Tool or Code Reader",
            "Multimeter",
            "Test light",
            "Logic probe",
            "Oscilloscope",
            "Fuel pressure gauge set",
            "Vacuum gauge",
            "Compression tester",
            "Leak-down tester",
            "Smoke machine",
            "Manufacturer diagnostic software/interfaces"
          ]
        }
      ]
    }
  };

  // Quick link categories with icons
  const quickLinks = [
    { key: "general", label: "General Tools", icon: Wrench },
    { key: "brake", label: "Brake Tools", icon: ShieldAlert },
    { key: "oil", label: "Oil Change", icon: ArrowUp },
    { key: "fuel", label: "Fuel Service", icon: Fuel },
    { key: "tire", label: "Tire Service", icon: Gauge },
    { key: "ac", label: "A/C Service", icon: Snowflake },
    { key: "transmission", label: "Transmission", icon: RotateCcw },
    { key: "engine", label: "Engine Repair", icon: Hammer },
    { key: "cooling", label: "Cooling System", icon: Sparkles },
    { key: "suspension", label: "Suspension", icon: WrenchIcon },
    { key: "battery", label: "Battery Service", icon: Battery },
    { key: "diagnostics", label: "Diagnostics", icon: Activity }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Automotive Tool Categories</h1>
      
      {/* Quick Links Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Button 
                key={link.key}
                variant={activeCategory === link.key ? "default" : "outline"}
                className="h-auto py-3 flex flex-col items-center gap-2 w-full"
                onClick={() => setActiveCategory(link.key)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{link.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="bg-white shadow-md rounded-xl border border-gray-100 p-6">
        {toolsData[activeCategory as keyof typeof toolsData] && (
          <CategoryToolList 
            title={toolsData[activeCategory as keyof typeof toolsData].title}
            description={toolsData[activeCategory as keyof typeof toolsData].description}
            tools={toolsData[activeCategory as keyof typeof toolsData].categories}
          />
        )}
      </div>
    </div>
  );
};

export default ShoppingCategories;
