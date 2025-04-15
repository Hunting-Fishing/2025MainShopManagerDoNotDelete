
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoyaltyTabHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function LoyaltyTabHeader({ activeTab, onTabChange }: LoyaltyTabHeaderProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="settings">Program Settings</TabsTrigger>
        <TabsTrigger value="tiers">Loyalty Tiers</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
