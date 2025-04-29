
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, ShieldCheck, Truck, DropletIcon, BrakeWarning, Gauge, Thermometer, CarFront, Battery, Layers } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategories } from '@/hooks/useCategories';
import { CategoryToolList } from '@/components/shopping/CategoryToolList';

const ShoppingCategories: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general-tools");
  const { categories, isLoading } = useCategories();

  // Quick access category definitions with icons
  const quickAccessCategories = [
    { id: 'general-tools', name: 'General Tools', icon: Wrench, color: 'blue' },
    { id: 'safety-gear', name: 'Safety Gear', icon: ShieldCheck, color: 'green' },
    { id: 'oil-change', name: 'Oil Change', icon: DropletIcon, color: 'yellow' },
    { id: 'brake-repair', name: 'Brake Repair', icon: BrakeWarning, color: 'red' },
    { id: 'tire-service', name: 'Tire Service', icon: CarFront, color: 'purple' },
    { id: 'ac-service', name: 'A/C Service', icon: Thermometer, color: 'teal' },
    { id: 'transmission', name: 'Transmission', icon: Gauge, color: 'orange' },
    { id: 'battery', name: 'Battery Tools', icon: Battery, color: 'gray' },
    { id: 'diagnostic', name: 'Diagnostic', icon: Layers, color: 'blue' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/shopping">Shop</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="my-8">
        <h1 className="text-3xl font-bold mb-6">Automotive Tool Categories</h1>
        
        {/* Quick access category buttons */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">Quick Access Categories</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {quickAccessCategories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className={`flex flex-col items-center justify-center h-24 border-2 transition-all ${
                  activeTab === category.id ? 'border-primary bg-primary/5' : 'hover:bg-secondary/80'
                }`}
                onClick={() => setActiveTab(category.id)}
              >
                <category.icon className={`h-8 w-8 mb-2 text-${category.color}-600`} />
                <span className="text-xs text-center">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tabbed interface for tool categories */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Categories by Repair Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general-tools" value={activeTab} onValueChange={setActiveTab}>
              <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                <div className="flex w-max px-4">
                  <TabsList className="h-12 bg-transparent">
                    {quickAccessCategories.map(category => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
                      >
                        <category.icon className="h-4 w-4 mr-2" />
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </ScrollArea>
              
              <div className="mt-6">
                <TabsContent value="general-tools">
                  <CategoryToolList
                    title="General Tools"
                    description="Safety gear, lifting equipment, hand tools and more"
                    tools={[
                      {
                        category: "Safety Gear",
                        items: [
                          "Safety glasses",
                          "Nitrile gloves",
                          "Dust masks",
                          "Ear protection"
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
                          "Headlamp",
                          "Flashlight"
                        ]
                      }
                    ]}
                  />
                </TabsContent>
                
                <TabsContent value="oil-change">
                  <CategoryToolList
                    title="Oil Change Tools"
                    description="Everything needed for professional-grade oil changes"
                    tools={[
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
                    ]}
                  />
                </TabsContent>
                
                <TabsContent value="brake-repair">
                  <CategoryToolList
                    title="Brake Repair Tools"
                    description="Tools for disc and drum brake service"
                    tools={[
                      {
                        category: "Disc Brakes",
                        items: [
                          "Caliper piston tool / spreader / compressor",
                          "Brake cleaner",
                          "Sockets/Wrenches (for caliper bolts, mounting brackets)",
                          "Lug wrench"
                        ]
                      },
                      {
                        category: "Drum Brakes",
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
                    ]}
                  />
                </TabsContent>

                <TabsContent value="tire-service">
                  <CategoryToolList
                    title="Tire Service Tools"
                    description="Tools for tire maintenance and replacement"
                    tools={[
                      {
                        category: "Tire Service Equipment",
                        items: [
                          "Lug wrench or impact wrench with appropriate sockets",
                          "Torque wrench (essential for correctly tightening lug nuts)",
                          "Tire pressure gauge",
                          "Portable tire inflator/air compressor",
                          "Tire iron/pry bar (for dismounting/mounting)",
                          "Valve core tool",
                          "Wheel wedges/chocks",
                          "Jack and jack stands"
                        ]
                      }
                    ]}
                  />
                </TabsContent>

                <TabsContent value="ac-service">
                  <CategoryToolList
                    title="A/C Service Tools"
                    description="Specialized tools for air conditioning maintenance"
                    tools={[
                      {
                        category: "A/C Service Equipment",
                        items: [
                          "A/C manifold gauge set (for checking pressures)",
                          "Vacuum pump (for evacuating the system)",
                          "Refrigerant leak detector (electronic or UV dye)",
                          "Refrigerant scale (for accurate charging)",
                          "Thermometer (digital, infrared)",
                          "Schrader valve core removal tool",
                          "Can tap (for refrigerant cans)",
                          "Service port adapters"
                        ]
                      }
                    ]}
                  />
                </TabsContent>
                
                <TabsContent value="transmission">
                  <CategoryToolList
                    title="Transmission Service Tools"
                    description="Tools for transmission maintenance and repair"
                    tools={[
                      {
                        category: "Transmission Service Equipment",
                        items: [
                          "Fluid pump or funnel with long tube (for refilling)",
                          "Drain pan",
                          "Sockets/Wrenches (for drain/fill plugs, pan bolts)",
                          "Torque wrench",
                          "Transmission jack (if removing the transmission)",
                          "Diagnostic scan tool (for reading codes)",
                          "Seal puller/installer (if replacing seals)",
                          "Snap ring pliers (for internal work)"
                        ]
                      }
                    ]}
                  />
                </TabsContent>
                
                {/* Add similar TabsContent components for the remaining categories */}
                <TabsContent value="safety-gear">
                  <CategoryToolList
                    title="Safety Gear"
                    description="Essential protection equipment for automotive work"
                    tools={[
                      {
                        category: "Personal Protection",
                        items: [
                          "Safety glasses/goggles",
                          "Work gloves (various types)",
                          "Nitrile gloves",
                          "Ear protection",
                          "Face shields",
                          "Respirators and dust masks",
                          "Steel-toe boots",
                          "Shop aprons"
                        ]
                      }
                    ]}
                  />
                </TabsContent>
                
                <TabsContent value="battery">
                  <CategoryToolList
                    title="Battery Tools"
                    description="Tools for battery maintenance and replacement"
                    tools={[
                      {
                        category: "Battery Service Equipment",
                        items: [
                          "Sockets/Wrenches (for terminal clamps and hold-downs)",
                          "Battery terminal cleaner brush (post and clamp)",
                          "Battery terminal protector spray or grease",
                          "Memory saver (plugs into OBD-II or cigarette lighter)",
                          "Battery carrier/strap",
                          "Battery charger",
                          "Battery tester/multimeter"
                        ]
                      }
                    ]}
                  />
                </TabsContent>
                
                <TabsContent value="diagnostic">
                  <CategoryToolList
                    title="Diagnostic Tools"
                    description="Tools for vehicle diagnostics and troubleshooting"
                    tools={[
                      {
                        category: "Essential Diagnostic Equipment",
                        items: [
                          "OBD-II Scan Tool or Code Reader",
                          "Multimeter",
                          "Test light",
                          "Logic probe (for digital signals)",
                          "Oscilloscope (for detailed signal analysis)",
                          "Fuel pressure gauge set",
                          "Vacuum gauge",
                          "Compression tester",
                          "Leak-down tester",
                          "Smoke machine (for finding EVAP or vacuum leaks)"
                        ]
                      }
                    ]}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShoppingCategories;
