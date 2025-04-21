
export const parseTaggedItems = (content: string) => {
  // Example implementation to parse tagged items in the message
  const taggedItems = {
    workOrderIds: [],
    partIds: [],
    warrantyIds: [],
    jobIds: []
  };
  
  // Extract work order IDs - format #WO-123
  const workOrderRegex = /#WO-(\w+)/g;
  let workOrderMatch;
  while ((workOrderMatch = workOrderRegex.exec(content)) !== null) {
    taggedItems.workOrderIds.push(workOrderMatch[1]);
  }
  
  // Extract part IDs - format #P-123
  const partRegex = /#P-(\w+)/g;
  let partMatch;
  while ((partMatch = partRegex.exec(content)) !== null) {
    taggedItems.partIds.push(partMatch[1]);
  }
  
  // Extract warranty IDs - format #W-123
  const warrantyRegex = /#W-(\w+)/g;
  let warrantyMatch;
  while ((warrantyMatch = warrantyRegex.exec(content)) !== null) {
    taggedItems.warrantyIds.push(warrantyMatch[1]);
  }
  
  // Extract job IDs - format #J-123
  const jobRegex = /#J-(\w+)/g;
  let jobMatch;
  while ((jobMatch = jobRegex.exec(content)) !== null) {
    taggedItems.jobIds.push(jobMatch[1]);
  }
  
  return taggedItems;
};
