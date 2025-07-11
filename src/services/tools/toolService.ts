
import { getTools, getToolById, getToolsByCategory } from './liveToolService';
import { AffiliateTool } from '@/types/affiliate';

// Transform database tool to AffiliateTool for compatibility
const transformTool = (tool: any): AffiliateTool => ({
  id: tool.id,
  name: tool.title,
  description: tool.description || '',
  slug: tool.title?.toLowerCase().replace(/\s+/g, '-') || '',
  price: tool.price || 0,
  imageUrl: tool.image_url || '/assets/tools/default.jpg',
  category: 'Tools',
  manufacturer: 'Unknown',
  rating: tool.average_rating || 0,
  reviewCount: tool.review_count || 0,
  affiliateLink: tool.affiliate_link || '#',
  featured: tool.is_featured || false,
  bestSeller: tool.is_bestseller || false,
  tags: []
});

/**
 * Get all affiliate tools
 * @returns Promise<AffiliateTool[]>
 */
export const getAffiliateTools = async (): Promise<AffiliateTool[]> => {
  try {
    const tools = await getTools();
    return tools.map(transformTool);
  } catch (error) {
    console.error('Error fetching affiliate tools:', error);
    return [];
  }
};

/**
 * Get a single affiliate tool by ID
 * @param id Tool ID
 * @returns Promise<AffiliateTool | undefined>
 */
export const getAffiliateToolById = async (id: string): Promise<AffiliateTool | undefined> => {
  try {
    const tool = await getToolById(id);
    return tool ? transformTool(tool) : undefined;
  } catch (error) {
    console.error('Error fetching affiliate tool by ID:', error);
    return undefined;
  }
};

/**
 * Create a new affiliate tool (placeholder)
 */
export const createAffiliateTool = async (tool: Partial<AffiliateTool>): Promise<AffiliateTool> => {
  // TODO: Implement database creation when admin functionality is added
  throw new Error('Tool creation not yet implemented');
};

/**
 * Update an existing affiliate tool (placeholder)
 */
export const updateAffiliateTool = async (id: string, updates: Partial<AffiliateTool>): Promise<AffiliateTool> => {
  // TODO: Implement database update when admin functionality is added
  throw new Error('Tool update not yet implemented');
};

/**
 * Delete an affiliate tool (placeholder)
 */
export const deleteAffiliateTool = async (id: string): Promise<boolean> => {
  // TODO: Implement database deletion when admin functionality is added
  throw new Error('Tool deletion not yet implemented');
};
