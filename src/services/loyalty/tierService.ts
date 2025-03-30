
import { LoyaltyTier } from "@/types/loyalty";
import { DEFAULT_LOYALTY_TIERS } from "@/types/loyalty";

// Function to calculate tier based on lifetime points
export const calculateTier = (lifetimePoints: number): string => {
  const tiers = DEFAULT_LOYALTY_TIERS.slice().sort((a, b) => b.threshold - a.threshold);
  
  for (const tier of tiers) {
    if (lifetimePoints >= tier.threshold) {
      return tier.name;
    }
  }
  
  return 'Standard'; // Default tier
};

// Get tier details by name
export const getTierByName = (tierName: string): LoyaltyTier => {
  return DEFAULT_LOYALTY_TIERS.find(tier => tier.name === tierName) || DEFAULT_LOYALTY_TIERS[0];
};
