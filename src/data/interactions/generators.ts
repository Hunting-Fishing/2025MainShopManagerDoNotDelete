
import { v4 as uuidv4 } from "uuid";
import { CustomerInteraction, InteractionType } from "@/types/interaction";
import { workOrders } from "../workOrdersData";
import { customers } from "../customersData";
import { teamMembers } from "../teamData";
import { getCustomerFullName } from "@/types/customer";
import { getRandomCommunication, getRandomFollowUp } from "./types";

// Generate interactions from existing work orders
export const generateWorkOrderInteractions = (): CustomerInteraction[] => {
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
export const generateCommunicationInteractions = (): CustomerInteraction[] => {
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
export const generateFollowUps = (): CustomerInteraction[] => {
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
export const generatePartsInteractions = (): CustomerInteraction[] => {
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
