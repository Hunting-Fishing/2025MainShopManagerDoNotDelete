
import React, { useState } from 'react';
import { Manufacturer, ManufacturerCategory } from '@/types/affiliate';
import { Link } from 'react-router-dom';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Car, Truck, Ship, Tractor, Filter, Anchor, Hammer, Wrench } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ManufacturersGridProps {
  manufacturers: Manufacturer[];
}

// Map category to appropriate icon
const getCategoryIcon = (category: ManufacturerCategory) => {
  switch (category) {
    case 'automotive':
      return <Car className="h-5 w-5" />;
    case 'heavy-duty':
      return <Truck className="h-5 w-5" />;
    case 'equipment':
      return <Hammer className="h-5 w-5" />;
    case 'marine':
      return <Ship className="h-5 w-5" />;
    case 'atv-utv':
      return <Tractor className="h-5 w-5" />;
    case 'motorcycle':
      return <Wrench className="h-5 w-5" />; // Using Wrench as fallback for Motorcycle
    default:
      return <Wrench className="h-5 w-5" />;
  }
};

export default function ManufacturersGrid({ manufacturers }: ManufacturersGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Get all unique categories from manufacturers
  const categories = ["all", ...new Set(manufacturers.map(m => m.category))];
  
  // Filter manufacturers based on active category
  const filteredManufacturers = activeCategory === "all" 
    ? manufacturers 
    : manufacturers.filter(m => m.category === activeCategory);

  return (
    <div className="py-8">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Manufacturer</h2>
            <Link to="/manufacturers" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-6 overflow-x-auto">
              <TabsList className="inline-flex p-1 bg-gray-100 rounded-full min-w-max">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    onClick={() => setActiveCategory(category)}
                    className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:text-gray-900"
                  >
                    <div className="flex items-center gap-1.5">
                      {category !== "all" && (
                        <span className="hidden sm:inline-flex">
                          {getCategoryIcon(category as ManufacturerCategory)}
                        </span>
                      )}
                      {category === "all" && <Filter className="h-4 w-4 mr-1" />}
                      <span className="capitalize">{category.replace("-", " ")}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          <ResponsiveGrid 
            cols={{
              default: 2,
              sm: 3,
              md: 4,
              lg: 5
            }}
            className="gap-6"
          >
            {filteredManufacturers.map((manufacturer) => (
              <Link
                key={manufacturer.id}
                to={`/manufacturers/${manufacturer.slug}`}
                className="group flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-full h-24 flex items-center justify-center mb-4 relative">
                  <img
                    src={manufacturer.logoUrl}
                    alt={`${manufacturer.name} logo`}
                    className="max-h-24 max-w-full object-contain"
                  />
                  <Badge 
                    variant="info" 
                    className="absolute top-0 right-0 text-xs capitalize"
                  >
                    {manufacturer.category.replace("-", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  {getCategoryIcon(manufacturer.category)}
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{manufacturer.name}</h3>
                </div>
              </Link>
            ))}
          </ResponsiveGrid>
        </div>
      </div>
    </div>
  );
}
