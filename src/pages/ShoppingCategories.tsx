
import React, { useState } from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { 
  ShieldCheck, Tool, Wrench, Hammer, Brush, Lightbulb, Filter, Droplet, 
  Gauge, Car, Snowflake, Cog, Fan, Activity, BatteryFull, Workflow
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Define the category interface
interface ToolCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  badgeColor?: string;
  subcategories: ToolSubcategory[];
}

interface ToolSubcategory {
  id: string;
  name: string;
  items: string[];
}

const ShoppingCategories = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("general");
  
  // Define all the tool categories with their subcategories
  const toolCategories: ToolCategory[] = [
    {
      id: "general",
      name: "General Automotive Tools",
      icon: <Tool className="h-6 w-6" />,
      description: "Essential tools needed for most automotive work",
      badge: "Essential",
      badgeColor: "blue",
      subcategories: [
        {
          id: "safety",
          name: "Safety Gear",
          items: ["Safety glasses", "Nitrile gloves", "Dust masks", "Ear protection", "Mechanic gloves"]
        },
        {
          id: "lifting",
          name: "Lifting Equipment",
          items: ["Hydraulic floor jack", "Jack stands", "Vehicle ramps", "Wheel chocks", "Scissor jacks"]
        },
        {
          id: "hand-tools",
          name: "Hand Tools",
          items: ["Socket sets (metric & SAE)", "Wrench sets", "Screwdriver sets", "Pliers", "Torque wrench", "Breaker bar", "Hammers"]
        },
        {
          id: "cleaning",
          name: "Cleaning Supplies",
          items: ["Microfiber rags", "Degreaser", "Parts cleaner", "Brushes", "Drain pans"]
        },
        {
          id: "lighting",
          name: "Lighting",
          items: ["Work lights", "Headlamps", "Flashlights", "Underhood lights", "Inspection lights"]
        }
      ]
    },
    {
      id: "oil",
      name: "Oil Change Tools",
      icon: <Droplet className="h-6 w-6" />,
      description: "Everything needed for DIY oil changes",
      subcategories: [
        {
          id: "oil-basics",
          name: "Basic Oil Change Tools",
          items: ["Oil filter wrench", "Drain pan", "Funnel", "Oil filter socket", "Torque wrench"]
        }
      ]
    },
    {
      id: "brakes",
      name: "Brake Repair Tools",
      icon: <Filter className="h-6 w-6" />,
      description: "Tools for servicing disc and drum brakes",
      subcategories: [
        {
          id: "disc-brakes",
          name: "Disc Brake Tools",
          items: ["Caliper piston tool", "Brake cleaner", "Pad spreader", "Lug wrench"]
        },
        {
          id: "drum-brakes",
          name: "Drum Brake Tools",
          items: ["Brake spring pliers", "Brake spring tools", "Brake adjuster tools"]
        },
        {
          id: "general-brakes",
          name: "General Brake Tools",
          items: ["Brake fluid tester", "Bleeder wrench kit", "Tubing wrenches", "Line wrenches"]
        }
      ]
    },
    {
      id: "fuel",
      name: "Fuel Service Tools",
      icon: <Gauge className="h-6 w-6" />,
      description: "Tools for working with fuel systems",
      badge: "Specialized",
      badgeColor: "yellow",
      subcategories: [
        {
          id: "fuel-tools",
          name: "Fuel System Tools",
          items: ["Fuel line disconnect tools", "Fuel pressure tester", "Injector nozzle tester", "Fuel filter wrench", "Fuel transfer pump"]
        }
      ]
    },
    {
      id: "tires",
      name: "Tire Service Tools",
      icon: <Car className="h-6 w-6" />,
      description: "Tools for tire maintenance and repair",
      subcategories: [
        {
          id: "tire-tools",
          name: "Tire Tools",
          items: ["Lug wrench", "Torque wrench", "Tire pressure gauge", "Tire inflator", "Valve core tool"]
        }
      ]
    },
    {
      id: "ac",
      name: "Air Conditioning Tools",
      icon: <Snowflake className="h-6 w-6" />,
      description: "Tools for A/C system service and repair",
      badge: "Specialized",
      badgeColor: "purple",
      subcategories: [
        {
          id: "ac-tools",
          name: "A/C Service Tools",
          items: ["A/C manifold gauge set", "Vacuum pump", "Refrigerant leak detector", "Refrigerant scale", "Thermometer"]
        }
      ]
    },
    {
      id: "transmission",
      name: "Transmission Tools",
      icon: <Cog className="h-6 w-6" />,
      description: "Tools for transmission service",
      badge: "Advanced",
      badgeColor: "red",
      subcategories: [
        {
          id: "trans-tools",
          name: "Transmission Service Tools",
          items: ["Fluid pump", "Transmission pan gaskets", "Filter change kits", "Transmission jack", "Seal pullers"]
        }
      ]
    },
    {
      id: "engine",
      name: "Engine Repair Tools",
      icon: <Activity className="h-6 w-6" />,
      description: "Tools for engine diagnostics and repair",
      badge: "Advanced",
      badgeColor: "red",
      subcategories: [
        {
          id: "engine-diagnostics",
          name: "Engine Diagnostic Tools",
          items: ["Compression tester", "Leak-down tester", "Vacuum gauge", "Engine stethoscope"]
        },
        {
          id: "engine-timing",
          name: "Engine Timing Tools",
          items: ["Timing light", "Timing belt tools", "Camshaft/crankshaft tools"]
        },
        {
          id: "engine-internal",
          name: "Internal Engine Tools",
          items: ["Piston ring compressor", "Valve spring compressor", "Harmonic balancer puller"]
        }
      ]
    },
    {
      id: "cooling",
      name: "Cooling System Tools",
      icon: <Fan className="h-6 w-6" />,
      description: "Tools for cooling system maintenance",
      subcategories: [
        {
          id: "cooling-tools",
          name: "Cooling Tools",
          items: ["Radiator pressure tester", "Coolant funnel kit", "Hose clamp pliers", "Coolant tester"]
        }
      ]
    },
    {
      id: "suspension",
      name: "Steering & Suspension",
      icon: <Wrench className="h-6 w-6" />,
      description: "Tools for suspension work",
      badge: "Advanced",
      badgeColor: "orange",
      subcategories: [
        {
          id: "suspension-tools",
          name: "Suspension Tools",
          items: ["Ball joint separator", "Tie rod end puller", "Coil spring compressor", "Strut tools"]
        }
      ]
    },
    {
      id: "battery",
      name: "Battery Service Tools",
      icon: <BatteryFull className="h-6 w-6" />,
      description: "Tools for battery maintenance",
      subcategories: [
        {
          id: "battery-tools",
          name: "Battery Tools",
          items: ["Battery terminal cleaner", "Battery carrier", "Memory saver", "Battery tester"]
        }
      ]
    },
    {
      id: "diagnostics",
      name: "Vehicle Diagnostics",
      icon: <Workflow className="h-6 w-6" />,
      description: "Tools for vehicle diagnostics and troubleshooting",
      badge: "Essential",
      badgeColor: "green",
      subcategories: [
        {
          id: "diagnostic-tools",
          name: "Diagnostic Tools",
          items: ["OBD-II scanner", "Multimeter", "Test light", "Logic probe", "Fuel pressure gauge"]
        }
      ]
    }
  ];

  return (
    <ShoppingPageLayout 
      title="Automotive Tool Categories" 
      description="Find the right tools for your automotive repairs and maintenance"
      actions={
        <Button 
          variant="outline"
          onClick={() => navigate('/shopping/products')}
        >
          View All Products
        </Button>
      }
    >
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          These tool recommendations are based on professional mechanic experiences. As Amazon Associates, we earn from qualifying purchases on items you buy through our links.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left sidebar with categories */}
        <div className="md:col-span-3">
          <Card className="sticky top-20">
            <CardContent className="p-3">
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">CATEGORIES</h3>
                {toolCategories.map(category => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <div className="flex items-center w-full">
                      <span className="mr-2">{category.icon}</span>
                      <span className="truncate">{category.name}</span>
                      {category.badge && (
                        <Badge 
                          variant="outline" 
                          className={`ml-auto bg-${category.badgeColor}-100 text-${category.badgeColor}-800 border-${category.badgeColor}-300`}
                        >
                          {category.badge}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-9">
          <Tabs defaultValue={activeCategory} value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="hidden">
              {toolCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {toolCategories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                    {category.badge && (
                      <Badge 
                        className={`ml-3 bg-${category.badgeColor}-100 text-${category.badgeColor}-800 border-${category.badgeColor}-300`}
                      >
                        {category.badge}
                      </Badge>
                    )}
                  </h2>
                  <p className="text-muted-foreground mt-1">{category.description}</p>
                </div>
                
                <div className="space-y-6">
                  {category.subcategories.map(subcategory => (
                    <Card key={subcategory.id}>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-3">{subcategory.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {subcategory.items.map((item, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="bg-slate-50 hover:bg-slate-100 cursor-pointer py-1.5"
                              onClick={() => navigate(`/shopping/products?search=${encodeURIComponent(item)}`)}
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-8">
                  <Button 
                    onClick={() => navigate(`/shopping/products?category=${category.id}`)}
                    className="mr-2"
                  >
                    Browse {category.name}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/shopping/products')}
                  >
                    View All Products
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </ShoppingPageLayout>
  );
};

export default ShoppingCategories;
