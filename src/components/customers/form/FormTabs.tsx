
import React from "react";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormTabsProps {
  currentTab: string;
  setCurrentTab: (value: string) => void;
  hasPersonalErrors: boolean;
  hasBusinessErrors: boolean;
  hasPreferencesErrors: boolean;
  hasReferralFleetErrors: boolean;
  hasVehicleErrors: boolean;
  isMobile: boolean;
}

export const FormTabs: React.FC<FormTabsProps> = ({
  currentTab,
  setCurrentTab,
  hasPersonalErrors,
  hasBusinessErrors,
  hasPreferencesErrors,
  hasReferralFleetErrors,
  hasVehicleErrors,
  isMobile,
}) => {
  return (
    <div className="overflow-x-auto pb-2">
      <TabsList className={`w-full flex ${isMobile ? "justify-start" : "justify-between"} mb-6`}>
        <TabsTrigger 
          value="personal" 
          className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
        >
          Personal Info
          {hasPersonalErrors && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="business" 
          className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
        >
          Business
          {hasBusinessErrors && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="preferences" 
          className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
        >
          Preferences
          {hasPreferencesErrors && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="referral" 
          className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
        >
          Referral
          {hasReferralFleetErrors && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="vehicles" 
          className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
        >
          Vehicles
          {hasVehicleErrors && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </div>
  );
};
