
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";

interface FormTabsProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  hasPersonalErrors: boolean;
  hasBusinessErrors: boolean;
  hasPreferencesErrors: boolean;
  hasReferralErrors: boolean;
  hasVehicleErrors: boolean;
  hasHouseholdErrors?: boolean;
  hasSegmentErrors?: boolean;
  isMobile: boolean;
}

export const FormTabs: React.FC<FormTabsProps> = ({
  currentTab,
  setCurrentTab,
  hasPersonalErrors,
  hasBusinessErrors,
  hasPreferencesErrors,
  hasReferralErrors,
  hasVehicleErrors,
  hasHouseholdErrors = false,
  hasSegmentErrors = false,
  isMobile,
}) => {
  return (
    <TabsList className={`grid grid-cols-${isMobile ? '2' : '7'} mb-6`}>
      <TabsTrigger value="personal" onClick={() => setCurrentTab("personal")}>
        Personal 
        {hasPersonalErrors && (
          <AlertTriangle className="h-4 w-4 ml-1 text-destructive" />
        )}
      </TabsTrigger>
      <TabsTrigger value="business" onClick={() => setCurrentTab("business")}>
        Business
        {hasBusinessErrors && (
          <AlertTriangle className="h-4 w-4 ml-1 text-destructive" />
        )}
      </TabsTrigger>
      <TabsTrigger value="preferences" onClick={() => setCurrentTab("preferences")}>
        Preferences
        {hasPreferencesErrors && (
          <AlertTriangle className="h-4 w-4 ml-1 text-destructive" />
        )}
      </TabsTrigger>
      <TabsTrigger value="referral" onClick={() => setCurrentTab("referral")}>
        Referral
        {hasReferralErrors && (
          <AlertTriangle className="h-4 w-4 ml-1 text-destructive" />
        )}
      </TabsTrigger>
      <TabsTrigger value="vehicles" onClick={() => setCurrentTab("vehicles")}>
        Vehicles
        {hasVehicleErrors && (
          <AlertTriangle className="h-4 w-4 ml-1 text-destructive" />
        )}
      </TabsTrigger>
      <TabsTrigger value="household" onClick={() => setCurrentTab("household")}>
        Household
        {hasHouseholdErrors && (
          <AlertTriangle className="h-4 w-4 ml-1 text-destructive" />
        )}
      </TabsTrigger>
      <TabsTrigger value="segments" onClick={() => setCurrentTab("segments")}>
        Segments
        {hasSegmentErrors && (
          <AlertTriangle className="h-4 w-4 ml-1 text-destructive" />
        )}
      </TabsTrigger>
    </TabsList>
  );
};
