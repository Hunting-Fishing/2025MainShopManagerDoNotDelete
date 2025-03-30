
import { CustomerInteraction, InteractionType } from "@/types/interaction";
import { v4 as uuidv4 } from "uuid";
import { 
  generateWorkOrderInteractions, 
  generateCommunicationInteractions, 
  generatePartsInteractions, 
  generateFollowUps
} from "./generators";
import { customerInteractions } from "./types";

// Initialize customer interactions array with generated interactions
const initializeInteractions = () => {
  // Combine all interactions and sort by date (most recent first)
  customerInteractions.push(
    ...generateWorkOrderInteractions(),
    ...generateCommunicationInteractions(),
    ...generatePartsInteractions(),
    ...generateFollowUps()
  );
  
  // Sort by date, most recent first
  customerInteractions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Initialize interactions on module load
initializeInteractions();

// Function to get interactions for a specific customer
export const getCustomerInteractions = (customerId: string): CustomerInteraction[] => {
  return customerInteractions.filter(interaction => interaction.customerId === customerId);
};

// Export the function that was needed by useCustomerDetails.ts
export const getMockInteractions = (customerId: string): CustomerInteraction[] => {
  return getCustomerInteractions(customerId);
};

// Function to get pending follow-ups
export const getPendingFollowUps = (): CustomerInteraction[] => {
  return customerInteractions.filter(
    interaction => interaction.type === 'follow_up' && 
                  !interaction.followUpCompleted &&
                  interaction.followUpDate
  );
};

// Function to complete a follow-up
export const completeFollowUp = (interactionId: string): CustomerInteraction | undefined => {
  const interactionIndex = customerInteractions.findIndex(i => i.id === interactionId);
  
  if (interactionIndex >= 0) {
    customerInteractions[interactionIndex] = {
      ...customerInteractions[interactionIndex],
      followUpCompleted: true,
      status: "completed"
    };
    
    return customerInteractions[interactionIndex];
  }
  
  return undefined;
};

// Function to add a new interaction
export const addInteraction = (interaction: Omit<CustomerInteraction, "id">): CustomerInteraction => {
  const newInteraction: CustomerInteraction = {
    id: uuidv4(),
    ...interaction
  };
  
  customerInteractions.unshift(newInteraction);
  return newInteraction;
};

// Re-export everything that was in the original file
export * from "./types";
