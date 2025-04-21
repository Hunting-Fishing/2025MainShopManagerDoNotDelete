
interface TaggedItems {
  workOrderIds: string[];
  partIds: string[];
  warrantyIds: string[];
  jobIds: string[];
}

// Parse tagged items from message content
export const parseTaggedItems = (content: string): TaggedItems => {
  const tagged: TaggedItems = {
    workOrderIds: [],
    partIds: [],
    warrantyIds: [],
    jobIds: []
  };
  
  // Match all #wo-123, #part-123, #warranty-123, #job-123 patterns
  const workOrderRegex = /#wo-([a-zA-Z0-9_-]+)/g;
  const partRegex = /#part-([a-zA-Z0-9_-]+)/g;
  const warrantyRegex = /#warranty-([a-zA-Z0-9_-]+)/g;
  const jobRegex = /#job-([a-zA-Z0-9_-]+)/g;
  
  let match;
  
  // Extract work order IDs
  while ((match = workOrderRegex.exec(content)) !== null) {
    tagged.workOrderIds.push(match[1]);
  }
  
  // Extract part IDs
  while ((match = partRegex.exec(content)) !== null) {
    tagged.partIds.push(match[1]);
  }
  
  // Extract warranty IDs
  while ((match = warrantyRegex.exec(content)) !== null) {
    tagged.warrantyIds.push(match[1]);
  }
  
  // Extract job IDs
  while ((match = jobRegex.exec(content)) !== null) {
    tagged.jobIds.push(match[1]);
  }
  
  return tagged;
};
