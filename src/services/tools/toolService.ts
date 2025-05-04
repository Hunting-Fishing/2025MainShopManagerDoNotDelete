
import { AffiliateTool } from '@/types/affiliate';

// Mock data for affiliate tools
const mockTools: AffiliateTool[] = [
  {
    id: '1',
    name: 'Premium Socket Set',
    description: 'Professional-grade socket set with 40+ pieces',
    slug: 'premium-socket-set',
    price: 129.99,
    imageUrl: '/assets/tools/socket-set.jpg',
    category: 'Hand Tools',
    manufacturer: 'ToolMaster',
    rating: 4.8,
    reviewCount: 245,
    affiliateLink: 'https://example.com/affiliate/socket-set',
    featured: true,
    tags: ['professional', 'mechanic', 'premium']
  },
  {
    id: '2',
    name: 'Digital Multimeter',
    description: 'Precision digital multimeter with auto-ranging capability',
    slug: 'digital-multimeter',
    price: 79.99,
    imageUrl: '/assets/tools/multimeter.jpg',
    category: 'Electrical',
    manufacturer: 'VoltPro',
    rating: 4.6,
    reviewCount: 189,
    affiliateLink: 'https://example.com/affiliate/multimeter',
    tags: ['electrical', 'diagnostic']
  },
  {
    id: '3',
    name: 'Cordless Impact Driver',
    description: '20V cordless impact driver with brushless motor',
    slug: 'cordless-impact-driver',
    price: 149.99,
    imageUrl: '/assets/tools/impact-driver.jpg',
    category: 'Power Tools',
    manufacturer: 'DrillMaster',
    rating: 4.9,
    reviewCount: 312,
    affiliateLink: 'https://example.com/affiliate/impact-driver',
    bestSeller: true,
    tags: ['power-tool', 'cordless', 'professional']
  },
];

/**
 * Get all affiliate tools
 * @returns Promise<AffiliateTool[]>
 */
export const getAffiliateTools = async (): Promise<AffiliateTool[]> => {
  // In a real app, this would fetch from an API or database
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTools);
    }, 500);
  });
};

/**
 * Get a single affiliate tool by ID
 * @param id Tool ID
 * @returns Promise<AffiliateTool | undefined>
 */
export const getAffiliateToolById = async (id: string): Promise<AffiliateTool | undefined> => {
  // In a real app, this would fetch from an API or database
  return new Promise((resolve) => {
    setTimeout(() => {
      const tool = mockTools.find(tool => tool.id === id);
      resolve(tool);
    }, 300);
  });
};

/**
 * Create a new affiliate tool
 * @param tool Tool data
 * @returns Promise<AffiliateTool>
 */
export const createAffiliateTool = async (tool: Partial<AffiliateTool>): Promise<AffiliateTool> => {
  // In a real app, this would be sent to an API or database
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTool: AffiliateTool = {
        id: Date.now().toString(),
        name: tool.name || 'Untitled Tool',
        description: tool.description || '',
        slug: tool.slug || tool.name?.toLowerCase().replace(/\s+/g, '-') || 'untitled-tool',
        price: tool.price,
        imageUrl: tool.imageUrl,
        category: tool.category || 'Uncategorized',
        manufacturer: tool.manufacturer || 'Unknown',
        rating: tool.rating,
        reviewCount: tool.reviewCount,
        affiliateLink: tool.affiliateLink || '#',
        featured: tool.featured || false,
        bestSeller: tool.bestSeller || false,
        tags: tool.tags || []
      };
      
      // In a real app, we would add this to the database
      resolve(newTool);
    }, 500);
  });
};

/**
 * Update an existing affiliate tool
 * @param id Tool ID
 * @param updates Tool data updates
 * @returns Promise<AffiliateTool>
 */
export const updateAffiliateTool = async (id: string, updates: Partial<AffiliateTool>): Promise<AffiliateTool> => {
  // In a real app, this would update an API or database
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const toolIndex = mockTools.findIndex(tool => tool.id === id);
      if (toolIndex === -1) {
        reject(new Error('Tool not found'));
        return;
      }
      
      const updatedTool = {
        ...mockTools[toolIndex],
        ...updates
      };
      
      // In a real app, we would update this in the database
      resolve(updatedTool);
    }, 500);
  });
};

/**
 * Delete an affiliate tool
 * @param id Tool ID
 * @returns Promise<boolean>
 */
export const deleteAffiliateTool = async (id: string): Promise<boolean> => {
  // In a real app, this would delete from an API or database
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, we would remove this from the database
      resolve(true);
    }, 500);
  });
};
