import { CustomerInteraction } from "@/types/interaction";
import { v4 as uuidv4 } from "uuid";
import { workOrders } from "./workOrdersData";
import { customers } from "./customersData";
import { teamMembers } from "./teamData";
import { getCustomerFullName } from "@/types/customer";

// Generate interactions from existing work orders
const generateWorkOrderInteractions = (): CustomerInteraction[] => {
  return workOrders.map(order => {
    const customer = customers.find(c => getCustomerFullName(c) === order.customer);
    return {
      id: uuidv4(),
      customerId: customer?.id || "",
      customerName: order.customer,
      date: order.date,
      type: 'work_order',
      description: `Created work order: ${order.description}`,
      staffMemberId: teamMembers.find(t => t.name === order.technician)?.id || "",
      staffMemberName: order.technician,
      status: order.status === "completed" ? "completed" : 
             order.status === "cancelled" ? "cancelled" : 
             order.status === "in-progress" ? "in_progress" : "pending",
      relatedWorkOrderId: order.id
    };
  });
};

// Generate some communication interactions
const generateCommunicationInteractions = (): CustomerInteraction[] => {
  const interactions: CustomerInteraction[] = [];
  
  customers.forEach(customer => {
    // Add 0-3 random communications per customer
    const numCommunications = Math.floor(Math.random() * 4);
    const customerName = getCustomerFullName(customer);
    
    for (let i = 0; i < numCommunications; i++) {
      const staffMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      interactions.push({
        id: uuidv4(),
        customerId: customer.id,
        customerName: customerName,
        date: date.toISOString().split('T')[0],
        type: 'communication',
        description: getRandomCommunication(),
        staffMemberId: staffMember.id,
        staffMemberName: staffMember.name,
        status: "completed"
      });
    }
  });
  
  return interactions;
};

// Generate follow-up interactions
const generateFollowUps = (): CustomerInteraction[] => {
  const interactions: CustomerInteraction[] = [];
  
  customers.forEach(customer => {
    // Add 0-2 follow-ups per customer
    const numFollowUps = Math.floor(Math.random() * 3);
    const customerName = getCustomerFullName(customer);
    
    for (let i = 0; i < numFollowUps; i++) {
      const staffMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      const daysAgo = Math.floor(Math.random() * 15);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      // Set follow-up date 7-14 days from interaction date
      const followUpDays = 7 + Math.floor(Math.random() * 8);
      const followUpDate = new Date(date);
      followUpDate.setDate(followUpDate.getDate() + followUpDays);
      
      // Determine if follow-up is completed based on whether the follow-up date has passed
      const followUpCompleted = followUpDate < new Date();
      
      interactions.push({
        id: uuidv4(),
        customerId: customer.id,
        customerName: customerName,
        date: date.toISOString().split('T')[0],
        type: 'follow_up',
        description: `Scheduled follow-up: ${getRandomFollowUp()}`,
        staffMemberId: staffMember.id,
        staffMemberName: staffMember.name,
        status: followUpCompleted ? "completed" : "pending",
        followUpDate: followUpDate.toISOString().split('T')[0],
        followUpCompleted
      });
    }
  });
  
  return interactions;
};

// Generate parts-related interactions
const generatePartsInteractions = (): CustomerInteraction[] => {
  const interactions: CustomerInteraction[] = [];
  
  // Get work orders with inventory items
  const workOrdersWithParts = workOrders.filter(order => order.inventoryItems && order.inventoryItems.length > 0);
  
  workOrdersWithParts.forEach(order => {
    const staffMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
    const customer = customers.find(c => getCustomerFullName(c) === order.customer);
    
    interactions.push({
      id: uuidv4(),
      customerId: customer?.id || "",
      customerName: order.customer,
      date: order.date,
      type: 'parts',
      description: `Ordered parts for work order ${order.id}`,
      staffMemberId: staffMember.id,
      staffMemberName: staffMember.name,
      status: "completed",
      relatedWorkOrderId: order.id
    });
  });
  
  return interactions;
};

// Helper functions for generating random descriptions
const getRandomCommunication = (): string => {
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

const getRandomFollowUp = (): string => {
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

// Combine all interactions and sort by date (most recent first)
export const customerInteractions: CustomerInteraction[] = [
  ...generateWorkOrderInteractions(),
  ...generateCommunicationInteractions(),
  ...generatePartsInteractions(),
  ...generateFollowUps()
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Function to get interactions for a specific customer
export const getCustomerInteractions = (customerId: string): CustomerInteraction[] => {
  return customerInteractions.filter(interaction => interaction.customerId === customerId);
};

// Export the function that was missing - using the same logic as getCustomerInteractions
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
