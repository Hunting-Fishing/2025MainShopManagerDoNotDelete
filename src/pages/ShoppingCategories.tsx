
import React, { useState } from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wrench, Shield, ArrowUpDown, Cog, Settings, Gauge, Fuel, ArrowRight, Brain, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ShoppingCategories = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("general");
  
  const handleViewCategory = (categoryId: string) => {
    navigate(`/shopping/products?category=${categoryId}`);
  };

  return (
    <ShoppingPageLayout 
      title="Tool Categories" 
      description="Explore our comprehensive range of automotive tool categories organized by repair type"
    >
      <div className="flex flex-col gap-6">
        {/* Quick links for most common tool categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickCategoryLinks.map((category) => (
            <Button 
              key={category.id}
              variant="outline" 
              className="flex flex-col h-auto py-4 gap-2 text-center items-center justify-center"
              onClick={() => handleViewCategory(category.id)}
            >
              <category.icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium line-clamp-2">{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Main categories tabs */}
        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <ScrollArea className="w-full">
            <div className="border-b overflow-x-auto">
              <TabsList className="h-12 bg-transparent inline-flex w-max">
                <TabsTrigger value="general" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  General Tools
                </TabsTrigger>
                <TabsTrigger value="oil" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Oil Change
                </TabsTrigger>
                <TabsTrigger value="brake" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Brake Repair
                </TabsTrigger>
                <TabsTrigger value="fuel" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Fuel Service
                </TabsTrigger>
                <TabsTrigger value="tires" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Tire Service
                </TabsTrigger>
                <TabsTrigger value="ac" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  A/C Service
                </TabsTrigger>
                <TabsTrigger value="transmission" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Transmission
                </TabsTrigger>
                <TabsTrigger value="engine" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Engine Repair
                </TabsTrigger>
                <TabsTrigger value="cooling" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Cooling System
                </TabsTrigger>
                <TabsTrigger value="suspension" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Suspension
                </TabsTrigger>
                <TabsTrigger value="battery" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Battery
                </TabsTrigger>
                <TabsTrigger value="diagnostics" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12">
                  Diagnostics
                </TabsTrigger>
              </TabsList>
            </div>
          </ScrollArea>
          
          {/* General Tools Content */}
          <TabsContent value="general" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {generalCategories.map((section) => (
                <Card key={section.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center gap-2">
                      <section.icon className="h-5 w-5 text-primary" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {section.tools.map((tool, idx) => (
                        <CategoryToolCard 
                          key={`${section.id}-${idx}`}
                          title={tool.title}
                          description={tool.description}
                          onClick={() => handleViewCategory(tool.categoryId)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Oil Change Content */}
          <TabsContent value="oil" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-primary" />
                  Oil Change Tools
                </CardTitle>
                <CardDescription>Essential tools for performing oil changes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {oilChangeTools.map((tool, idx) => (
                    <CategoryToolCard 
                      key={`oil-${idx}`} 
                      title={tool.title} 
                      description={tool.description}
                      onClick={() => handleViewCategory(tool.categoryId)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Brake Repair Content */}
          <TabsContent value="brake" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {brakeCategories.map((section) => (
                <Card key={section.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {section.tools.map((tool, idx) => (
                        <CategoryToolCard 
                          key={`${section.id}-${idx}`} 
                          title={tool.title} 
                          description={tool.description}
                          onClick={() => handleViewCategory(tool.categoryId)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Fuel Service Content */}
          <TabsContent value="fuel" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-primary" />
                  Fuel Service Tools
                </CardTitle>
                <CardDescription>Specialized tools for fuel system maintenance and repair</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fuelServiceTools.map((tool, idx) => (
                    <CategoryToolCard 
                      key={`fuel-${idx}`} 
                      title={tool.title} 
                      description={tool.description}
                      onClick={() => handleViewCategory(tool.categoryId)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholder content for other tabs */}
          <TabsContent value="tires" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">Tire Service Tools</CardTitle>
                <CardDescription>Tools for tire maintenance, repair and replacement</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tireTools.map((tool, idx) => (
                    <CategoryToolCard 
                      key={`tire-${idx}`} 
                      title={tool.title} 
                      description={tool.description}
                      onClick={() => handleViewCategory(tool.categoryId)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ac" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-primary" />
                  A/C Service Tools
                </CardTitle>
                <CardDescription>Equipment for air conditioning system service and repair</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {acServiceTools.map((tool, idx) => (
                    <CategoryToolCard 
                      key={`ac-${idx}`} 
                      title={tool.title} 
                      description={tool.description}
                      onClick={() => handleViewCategory(tool.categoryId)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnostics" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Diagnostic Tools
                </CardTitle>
                <CardDescription>Tools for vehicle diagnosis and troubleshooting</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {diagnosticTools.map((tool, idx) => (
                    <CategoryToolCard 
                      key={`diagnostic-${idx}`} 
                      title={tool.title} 
                      description={tool.description}
                      onClick={() => handleViewCategory(tool.categoryId)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Placeholders for remaining tabs */}
          <TabsContent value="transmission" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Transmission Service Tools</h3>
                <p className="text-muted-foreground">Tools for servicing and repairing automotive transmissions.</p>
                {/* Full content would go here */}
                <Button onClick={() => navigate('/shopping/products?category=transmission')} className="mt-4">
                  Browse Transmission Tools
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="engine" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Engine Repair Tools</h3>
                <p className="text-muted-foreground">Specialized tools for engine diagnostics and repairs.</p>
                {/* Full content would go here */}
                <Button onClick={() => navigate('/shopping/products?category=engine')} className="mt-4">
                  Browse Engine Repair Tools
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cooling" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Cooling System Tools</h3>
                <p className="text-muted-foreground">Tools for maintaining and repairing vehicle cooling systems.</p>
                {/* Full content would go here */}
                <Button onClick={() => navigate('/shopping/products?category=cooling')} className="mt-4">
                  Browse Cooling System Tools
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="suspension" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Steering & Suspension Tools</h3>
                <p className="text-muted-foreground">Tools for working on vehicle steering and suspension systems.</p>
                {/* Full content would go here */}
                <Button onClick={() => navigate('/shopping/products?category=suspension')} className="mt-4">
                  Browse Suspension Tools
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="battery" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Battery Tools</h3>
                <p className="text-muted-foreground">Tools for battery testing, charging and replacement.</p>
                {/* Full content would go here */}
                <Button onClick={() => navigate('/shopping/products?category=battery')} className="mt-4">
                  Browse Battery Tools
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ShoppingPageLayout>
  );
};

// Component for individual tool cards
interface CategoryToolCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const CategoryToolCard: React.FC<CategoryToolCardProps> = ({ title, description, onClick }) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div>
          <h3 className="font-semibold text-sm mb-2">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>
        <div className="flex justify-end mt-3">
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Category Links
const quickCategoryLinks = [
  { id: 'hand-tools', name: 'Hand Tools', icon: Wrench },
  { id: 'safety-gear', name: 'Safety Gear', icon: Shield },
  { id: 'lifting-equipment', name: 'Lifting Equipment', icon: ArrowUpDown },
  { id: 'diagnostic-tools', name: 'Diagnostic Tools', icon: Gauge },
  { id: 'engine-tools', name: 'Engine Tools', icon: Cog },
  { id: 'oil-service', name: 'Oil Change Tools', icon: Fuel },
];

// General Automotive Tool Categories
const generalCategories = [
  {
    id: 'safety-gear',
    title: 'Safety Gear',
    icon: Shield,
    description: 'Essential safety equipment for automotive work',
    tools: [
      { title: 'Safety Glasses', description: 'Protect eyes from debris and chemicals', categoryId: 'safety-glasses' },
      { title: 'Work Gloves', description: 'Nitrile gloves for protection from chemicals and oils', categoryId: 'work-gloves' },
      { title: 'Dust Masks', description: 'Protect lungs from harmful particles', categoryId: 'dust-masks' },
    ]
  },
  {
    id: 'lifting-equipment',
    title: 'Lifting Equipment',
    icon: ArrowUpDown,
    description: 'Tools for safely lifting and supporting vehicles',
    tools: [
      { title: 'Hydraulic Floor Jacks', description: 'For lifting vehicles safely', categoryId: 'floor-jacks' },
      { title: 'Jack Stands', description: 'For secure support when vehicle is raised', categoryId: 'jack-stands' },
      { title: 'Vehicle Ramps', description: 'For quick, easy vehicle raising', categoryId: 'vehicle-ramps' },
      { title: 'Wheel Chocks', description: 'Prevent vehicle movement during service', categoryId: 'wheel-chocks' },
    ]
  },
  {
    id: 'hand-tools',
    title: 'Hand Tools',
    icon: Wrench,
    description: 'Essential hand tools for automotive repairs',
    tools: [
      { title: 'Socket Sets', description: 'Metric & SAE socket sets for various fasteners', categoryId: 'socket-sets' },
      { title: 'Wrench Sets', description: 'Combination, Allen/hex, Torx wrench sets', categoryId: 'wrench-sets' },
      { title: 'Screwdriver Sets', description: 'Phillips, flathead, and Torx screwdrivers', categoryId: 'screwdriver-sets' },
      { title: 'Pliers', description: 'Needlenose, locking, and slip-joint pliers', categoryId: 'pliers' },
      { title: 'Torque Wrenches', description: 'For precise fastener tightening', categoryId: 'torque-wrenches' },
      { title: 'Hammers', description: 'Various types for different applications', categoryId: 'hammers' },
    ]
  },
];

// Oil Change Tools
const oilChangeTools = [
  { title: 'Oil Filter Wrenches', description: 'Different types for various filter sizes', categoryId: 'oil-filter-wrenches' },
  { title: 'Funnels', description: 'For clean oil pouring', categoryId: 'funnels' },
  { title: 'Oil Drain Pans', description: 'Containers for collecting used oil', categoryId: 'oil-drain-pans' },
  { title: 'Drain Plug Sockets', description: 'Specialized sockets for oil drain plugs', categoryId: 'drain-plug-sockets' },
  { title: 'Oil Change Kits', description: 'Complete sets of oil change tools', categoryId: 'oil-change-kits' },
];

// Brake Repair Categories
const brakeCategories = [
  {
    id: 'disc-brakes',
    title: 'Disc Brake Tools',
    description: 'Tools specifically for disc brake service',
    tools: [
      { title: 'Caliper Piston Tools', description: 'For compressing brake calipers', categoryId: 'caliper-tools' },
      { title: 'Brake Cleaners', description: 'Solvents for cleaning brake components', categoryId: 'brake-cleaners' },
      { title: 'Caliper Wrenches', description: 'For caliper bolts and mounting brackets', categoryId: 'caliper-wrenches' },
    ]
  },
  {
    id: 'drum-brakes',
    title: 'Drum Brake Tools',
    description: 'Tools specifically for drum brake service',
    tools: [
      { title: 'Brake Spring Pliers', description: 'For removing and installing brake springs', categoryId: 'spring-pliers' },
      { title: 'Brake Spring Tools', description: 'Compressors and installers for brake springs', categoryId: 'spring-tools' },
      { title: 'Brake Adjusters', description: 'Tools for adjusting drum brakes', categoryId: 'brake-adjusters' },
    ]
  },
  {
    id: 'brake-general',
    title: 'General Brake Service Tools',
    description: 'Tools used for all brake system services',
    tools: [
      { title: 'Brake Bleeding Kits', description: 'For removing air from brake lines', categoryId: 'bleeding-kits' },
      { title: 'Brake Line Wrenches', description: 'For brake line fittings', categoryId: 'line-wrenches' },
      { title: 'Brake Fluid Testers', description: 'For checking brake fluid condition', categoryId: 'fluid-testers' },
    ]
  },
];

// Fuel Service Tools
const fuelServiceTools = [
  { title: 'Fuel Line Disconnect Tools', description: 'For various fuel line connection types', categoryId: 'fuel-disconnect' },
  { title: 'Fuel Pressure Testers', description: 'For diagnosing fuel system issues', categoryId: 'fuel-pressure' },
  { title: 'Fuel Injector Testers', description: 'For testing injector performance', categoryId: 'injector-testers' },
  { title: 'Fuel Filter Tools', description: 'Specialized wrenches for filter removal', categoryId: 'filter-tools' },
  { title: 'Fuel Transfer Pumps', description: 'For safe fuel tank service', categoryId: 'transfer-pumps' },
  { title: 'Fuel Tank Lock Ring Tools', description: 'For accessing fuel pump modules', categoryId: 'lock-ring-tools' },
];

// Tire Tools
const tireTools = [
  { title: 'Lug Wrenches', description: 'For removing and installing wheel lugs', categoryId: 'lug-wrenches' },
  { title: 'Torque Wrenches', description: 'For proper lug nut tightening', categoryId: 'torque-wrenches' },
  { title: 'Tire Pressure Gauges', description: 'For checking tire pressure', categoryId: 'pressure-gauges' },
  { title: 'Portable Air Compressors', description: 'For inflating tires', categoryId: 'air-compressors' },
  { title: 'Tire Irons', description: 'For manual tire mounting/dismounting', categoryId: 'tire-irons' },
  { title: 'Valve Tools', description: 'For valve stem service', categoryId: 'valve-tools' },
];

// A/C Service Tools
const acServiceTools = [
  { title: 'A/C Manifold Gauge Sets', description: 'For checking system pressures', categoryId: 'gauge-sets' },
  { title: 'Vacuum Pumps', description: 'For evacuating A/C systems', categoryId: 'vacuum-pumps' },
  { title: 'Leak Detectors', description: 'Electronic and dye-based leak detection', categoryId: 'leak-detectors' },
  { title: 'Refrigerant Scales', description: 'For accurate system charging', categoryId: 'refrigerant-scales' },
  { title: 'Service Port Adapters', description: 'For different A/C system fittings', categoryId: 'port-adapters' },
  { title: 'Recovery Machines', description: 'For professional refrigerant recovery', categoryId: 'recovery-machines' },
];

// Diagnostic Tools
const diagnosticTools = [
  { title: 'OBD-II Scan Tools', description: 'From basic code readers to advanced scanners', categoryId: 'obd-scanners' },
  { title: 'Multimeters', description: 'For electrical testing and diagnosis', categoryId: 'multimeters' },
  { title: 'Test Lights', description: 'For quickly checking circuits', categoryId: 'test-lights' },
  { title: 'Compression Testers', description: 'For engine compression testing', categoryId: 'compression-testers' },
  { title: 'Vacuum Gauges', description: 'For engine performance diagnosis', categoryId: 'vacuum-gauges' },
  { title: 'Fuel Pressure Testers', description: 'For fuel system diagnosis', categoryId: 'fuel-testers' },
  { title: 'Battery Testers', description: 'For electrical system diagnosis', categoryId: 'battery-testers' },
];

export default ShoppingCategories;
