
import { useRelationshipData } from "@/hooks/useRelationshipData";
import { useBusinessConstants } from "@/hooks/useBusinessConstants";

// This file now re-exports the hooks that fetch data from the database
export { useRelationshipData };
export { useBusinessConstants };

// Export types for backwards compatibility
export type RelationshipType = {
  id: string;
  label: string;
};

// For backwards compatibility with any code that imports directly from this file
// These are empty placeholders, the real data is now in CustomerFormSchema.ts
export const shops: { id: string, name: string }[] = [];
export const relationshipTypes: RelationshipType[] = [];
export const predefinedTags = [];
export const predefinedSegments = [];
