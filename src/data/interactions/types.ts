
import { CustomerInteraction, InteractionType, InteractionStatus } from "@/types/interaction";

// Helper functions for generating random descriptions
export const getRandomCommunication = (): string => {
  const communications = [
    "Phone call about service scheduling",
    "Email regarding billing questions",
    "Text message confirming appointment",
    "In-person discussion about service options",
    "Video call to assess equipment remotely",
    "Left voicemail about upcoming maintenance",
    "Received customer feedback via online form"
  ];
  
  return communications[Math.floor(Math.random() * communications.length)];
};

export const getRandomFollowUp = (): string => {
  const followUps = [
    "Check customer satisfaction with recent service",
    "Discuss maintenance plan options",
    "Review equipment warranty information",
    "Provide quote for recommended upgrades",
    "Schedule seasonal maintenance visit",
    "Review service history and recommend preventative measures",
    "Discuss extended warranty options"
  ];
  
  return followUps[Math.floor(Math.random() * followUps.length)];
};

// The shared array of interactions, used by all the generators
export let customerInteractions: CustomerInteraction[] = [];
