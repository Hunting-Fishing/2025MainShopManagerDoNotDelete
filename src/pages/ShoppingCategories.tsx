import React from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Settings, Cog, LifeBuoy, Gauge, Fuel, ArrowRight } from 'lucide-react';

const ShoppingCategories = () => {
  return (
    <ShoppingPageLayout title="Tool Categories" description="Explore our wide range of automotive tool categories">
      <Tabs defaultActive="engine">
        <TabsList>
          <TabsTrigger value="engine">Engine Tools</TabsTrigger>
          <TabsTrigger value="brakes">Brake Tools</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostic Tools</TabsTrigger>
          <TabsTrigger value="body">Body & Interior Tools</TabsTrigger>
          <TabsTrigger value="electrical">Electrical Tools</TabsTrigger>
          <TabsTrigger value="fuel">Fuel System Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="engine">
          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <CategoryCard title="Cylinder Hones" description="Precision tools for cylinder resurfacing" icon={Cog} />
              <CategoryCard title="Valve Spring Compressors" description="Essential for valve maintenance" icon={Settings} />
              <CategoryCard title="Piston Ring Compressors" description="For easy piston installation" icon={Wrench} />
              <CategoryCard title="Engine Timing Tools" description="Ensure accurate engine timing" icon={Gauge} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brakes">
          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <CategoryCard title="Brake Caliper Tools" description="Tools for brake caliper service" icon={Cog} />
              <CategoryCard title="Brake Bleeding Kits" description="For efficient brake fluid replacement" icon={Settings} />
              <CategoryCard title="Brake Spring Tools" description="Tools for brake spring service" icon={Wrench} />
              <CategoryCard title="Brake Lathes" description="Ensure accurate engine timing" icon={Gauge} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics">
          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <CategoryCard title="OBD-II Scanners" description="Diagnose vehicle issues with ease" icon={Cog} />
              <CategoryCard title="Multimeters" description="Essential for electrical diagnostics" icon={Settings} />
              <CategoryCard title="Compression Testers" description="Evaluate engine compression" icon={Wrench} />
              <CategoryCard title="Timing Lights" description="Ensure accurate engine timing" icon={Gauge} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="body">
          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <CategoryCard title="Dent Pullers" description="Repair dents with precision" icon={Cog} />
              <CategoryCard title="Auto Body Hammers" description="Shape and smooth metal surfaces" icon={Settings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="electrical">
          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <CategoryCard title="Wire Strippers" description="Strip wires safely and efficiently" icon={Cog} />
              <CategoryCard title="Electrical Testers" description="Diagnose electrical issues" icon={Settings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel">
          <Card>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <CategoryCard title="Fuel Pressure Testers" description="Measure fuel pressure accurately" icon={Fuel} />
              <CategoryCard title="Fuel Injector Cleaners" description="Clean fuel injectors for optimal performance" icon={Settings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ShoppingPageLayout>
  );
};

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, icon: Icon }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="flex flex-col items-start space-y-3 p-4">
        <div className="rounded-full bg-secondary p-2 text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
};

export default ShoppingCategories;
