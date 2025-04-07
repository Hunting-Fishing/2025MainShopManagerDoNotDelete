
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, User, Building2, CreditCard, Users, Heart } from "lucide-react";

type TabValue = "personal" | "business" | "vehicles" | "preferences" | "household" | "loyalty";

interface FormTabsProps {
  initialTab?: string;
}

export const FormTabs: React.FC<FormTabsProps> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<TabValue>("personal");

  // Set initial tab if provided
  useEffect(() => {
    if (initialTab === 'vehicles') {
      setActiveTab('vehicles');
    }
  }, [initialTab]);
  
  return (
    <div className="sticky top-0 z-10 bg-background pb-4 pt-1">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="personal" className="flex items-center gap-2" data-section="personal">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal Info</span>
            <span className="inline sm:hidden">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2" data-section="business">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Business Info</span>
            <span className="inline sm:hidden">Business</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2" data-section="vehicles">
            <Car className="h-4 w-4" />
            <span>Vehicles</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2" data-section="preferences">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
            <span className="inline sm:hidden">Prefs</span>
          </TabsTrigger>
          <TabsTrigger value="household" className="flex items-center gap-2" data-section="household">
            <Users className="h-4 w-4" />
            <span>Household</span>
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-2" data-section="loyalty">
            <Heart className="h-4 w-4" />
            <span>Loyalty</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
